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
exports.registeredBySelect = exports.studentInclude = exports.StudentsService = void 0;
exports.toStudentResponse = toStudentResponse;
const common_1 = require("@nestjs/common");
const client_1 = require("../../generated/prisma/client");
const prisma_service_1 = require("../database/prisma.service");
const user_permissions_1 = require("../common/permissions/user-permissions");
const registeredBySelect = {
    id: true,
    firstName: true,
    lastName: true,
};
exports.registeredBySelect = registeredBySelect;
const studentInclude = {
    registeredBy: {
        select: registeredBySelect,
    },
};
exports.studentInclude = studentInclude;
function toStudentResponse(student) {
    return {
        id: student.id,
        firstName: student.firstName,
        secondName: student.secondName,
        thirdName: student.thirdName,
        fourthName: student.fourthName,
        section: student.section,
        phoneNumbers: student.phoneNumbers,
        guardianInfo: student.guardianInfo,
        comeViaWho: student.comeViaWho,
        schoolId: student.schoolId,
        registeredByUserId: student.registeredByUserId,
        registeredBy: student.registeredBy ?? null,
        registeredAt: student.registeredAt,
        pendingStudentId: student.pendingStudentId,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
    };
}
let StudentsService = class StudentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(actor, query) {
        if (!(0, user_permissions_1.hasPermission)(actor.role, actor.permissions, client_1.UserPermission.STUDENT_REGISTRATION)) {
            throw new common_1.ForbiddenException('You do not have permission to list students');
        }
        const page = query.page ?? 1;
        const limit = Math.min(query.limit ?? 20, 100);
        const skip = (page - 1) * limit;
        const where = { schoolId: actor.schoolId };
        const [data, total] = await Promise.all([
            this.prisma.student.findMany({
                where,
                include: studentInclude,
                skip,
                take: limit,
                orderBy: { registeredAt: 'desc' },
            }),
            this.prisma.student.count({ where }),
        ]);
        return {
            data: data.map(toStudentResponse),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StudentsService);
//# sourceMappingURL=students.service.js.map