"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingStudentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("../../generated/prisma/client");
const prisma_service_1 = require("../database/prisma.service");
const user_permissions_1 = require("../common/permissions/user-permissions");
const staffSelect = {
    id: true,
    firstName: true,
    lastName: true,
};
const pendingInclude = {
    submittedBy: {
        select: staffSelect,
    },
};
function normalizePhones(phones) {
    return phones.map((phone) => phone.trim()).filter(Boolean);
}
function toPendingResponse(row) {
    return {
        id: row.id,
        firstName: row.firstName,
        secondName: row.secondName,
        thirdName: row.thirdName,
        fourthName: row.fourthName,
        section: row.section,
        phoneNumbers: row.phoneNumbers,
        guardianInfo: row.guardianInfo,
        comeViaWho: row.comeViaWho,
        schoolId: row.schoolId,
        submittedByUserId: row.submittedByUserId,
        submittedBy: row.submittedBy ?? null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}
let PendingStudentsService = class PendingStudentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createCheckIn(dto) {
        const school = await this.prisma.school.findUnique({
            where: { code: dto.schoolCode },
        });
        if (!school) {
            throw new common_1.NotFoundException('Invalid school code');
        }
        const row = await this.prisma.pendingStudent.create({
            data: {
                firstName: dto.firstName.trim(),
                secondName: dto.secondName.trim(),
                comeViaWho: dto.comeViaWho?.trim() || null,
                schoolId: school.id,
            },
            include: pendingInclude,
        });
        return toPendingResponse(row);
    }
    async create(dto, actor) {
        if (!(0, user_permissions_1.hasPermission)(actor.role, actor.permissions, client_1.UserPermission.STUDENT_REGISTRATION)) {
            throw new common_1.ForbiddenException('You do not have permission to add pending students');
        }
        const row = await this.prisma.pendingStudent.create({
            data: {
                firstName: dto.firstName.trim(),
                secondName: dto.secondName.trim(),
                thirdName: dto.thirdName.trim(),
                fourthName: dto.fourthName.trim(),
                section: dto.section.trim(),
                phoneNumbers: normalizePhones(dto.phoneNumbers),
                guardianInfo: dto.guardianInfo?.trim() || null,
                comeViaWho: dto.comeViaWho.trim(),
                schoolId: actor.schoolId,
                submittedByUserId: actor.sub,
            },
            include: pendingInclude,
        });
        return toPendingResponse(row);
    }
    async findAll(actor, query) {
        if (!(0, user_permissions_1.hasPermission)(actor.role, actor.permissions, client_1.UserPermission.STUDENT_REGISTRATION)) {
            throw new common_1.ForbiddenException('You do not have permission to list pending students');
        }
        const page = query.page ?? 1;
        const limit = Math.min(query.limit ?? 20, 100);
        const skip = (page - 1) * limit;
        const where = { schoolId: actor.schoolId };
        const [data, total] = await Promise.all([
            this.prisma.pendingStudent.findMany({
                where,
                include: pendingInclude,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.pendingStudent.count({ where }),
        ]);
        return {
            data: data.map(toPendingResponse),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
    async update(id, dto, actor) {
        if (!(0, user_permissions_1.hasPermission)(actor.role, actor.permissions, client_1.UserPermission.STUDENT_REGISTRATION)) {
            throw new common_1.ForbiddenException('You do not have permission to update pending students');
        }
        const existing = await this.prisma.pendingStudent.findFirst({
            where: { id, schoolId: actor.schoolId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Pending student not found');
        }
        const row = await this.prisma.pendingStudent.update({
            where: { id },
            data: {
                ...(dto.firstName !== undefined && { firstName: dto.firstName.trim() }),
                ...(dto.secondName !== undefined && { secondName: dto.secondName.trim() }),
                ...(dto.thirdName !== undefined && { thirdName: dto.thirdName.trim() }),
                ...(dto.fourthName !== undefined && { fourthName: dto.fourthName.trim() }),
                ...(dto.section !== undefined && { section: dto.section.trim() }),
                ...(dto.phoneNumbers !== undefined && {
                    phoneNumbers: normalizePhones(dto.phoneNumbers),
                }),
                ...(dto.guardianInfo !== undefined && {
                    guardianInfo: dto.guardianInfo.trim() || null,
                }),
                ...(dto.comeViaWho !== undefined && {
                    comeViaWho: dto.comeViaWho.trim() || null,
                }),
            },
            include: pendingInclude,
        });
        return toPendingResponse(row);
    }
    assertReadyForApproval(pending) {
        if (!pending.section?.trim()) {
            throw new common_1.BadRequestException('Section is required before approval');
        }
        if (!pending.phoneNumbers.length) {
            throw new common_1.BadRequestException('At least one phone number is required before approval');
        }
    }
    async approve(id, actor) {
        if (!(0, user_permissions_1.hasPermission)(actor.role, actor.permissions, client_1.UserPermission.STUDENT_REGISTRATION)) {
            throw new common_1.ForbiddenException('You do not have permission to approve students');
        }
        const pending = await this.prisma.pendingStudent.findFirst({
            where: { id, schoolId: actor.schoolId },
        });
        if (!pending) {
            throw new common_1.NotFoundException('Pending student not found');
        }
        this.assertReadyForApproval(pending);
        return this.prisma.$transaction(async (tx) => {
            const student = await tx.student.create({
                data: {
                    firstName: pending.firstName,
                    secondName: pending.secondName,
                    thirdName: pending.thirdName,
                    fourthName: pending.fourthName,
                    section: pending.section.trim(),
                    phoneNumbers: pending.phoneNumbers,
                    guardianInfo: pending.guardianInfo,
                    comeViaWho: pending.comeViaWho,
                    schoolId: pending.schoolId,
                    registeredByUserId: actor.sub,
                    registeredAt: new Date(),
                    pendingStudentId: pending.id,
                },
                include: {
                    registeredBy: { select: staffSelect },
                },
            });
            await tx.pendingStudent.delete({ where: { id: pending.id } });
            return student;
        });
    }
};
exports.PendingStudentsService = PendingStudentsService;
exports.PendingStudentsService = PendingStudentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PendingStudentsService);
//# sourceMappingURL=pending-students.service.js.map