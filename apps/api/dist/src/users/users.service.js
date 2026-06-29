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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const client_1 = require("../../generated/prisma/client");
const prisma_service_1 = require("../database/prisma.service");
const user_permissions_1 = require("../common/permissions/user-permissions");
const BCRYPT_ROUNDS = 12;
const userSelect = {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    phone: true,
    role: true,
    permissions: true,
    status: true,
    schoolId: true,
    createdAt: true,
    updatedAt: true,
};
function resolvePermissions(role, permissions) {
    if (role === client_1.UserRole.MANAGER) {
        return [];
    }
    return permissions ?? [];
}
function canManageUsers(actor) {
    return (0, user_permissions_1.hasPermission)(actor.role, actor.permissions, client_1.UserPermission.USER_MANAGEMENT);
}
function isActorManager(actor) {
    return actor.role === client_1.UserRole.MANAGER;
}
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, actor) {
        if (!canManageUsers(actor)) {
            throw new common_1.ForbiddenException('You do not have permission to create users');
        }
        if (dto.role === client_1.UserRole.MANAGER && !isActorManager(actor)) {
            throw new common_1.ForbiddenException('Only managers can create manager accounts');
        }
        if (dto.permissions?.includes(client_1.UserPermission.USER_MANAGEMENT) &&
            !isActorManager(actor)) {
            throw new common_1.ForbiddenException('Only managers can grant user management permission');
        }
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new common_1.ConflictException('Email already registered');
        }
        const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                role: dto.role,
                permissions: resolvePermissions(dto.role, dto.permissions),
                status: client_1.UserStatus.ACTIVE,
                schoolId: actor.schoolId,
            },
            select: userSelect,
        });
        return user;
    }
    async findAll(actor, query) {
        if (!canManageUsers(actor)) {
            throw new common_1.ForbiddenException('You do not have permission to list users');
        }
        const page = query.page ?? 1;
        const limit = Math.min(query.limit ?? 20, 100);
        const skip = (page - 1) * limit;
        const where = {
            schoolId: actor.schoolId,
            ...(query.role && { role: query.role }),
            ...(query.status && { status: query.status }),
        };
        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                select: userSelect,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
    async findOne(id, actor) {
        const user = await this.prisma.user.findFirst({
            where: { id, schoolId: actor.schoolId },
            select: userSelect,
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!canManageUsers(actor) && actor.sub !== id) {
            throw new common_1.ForbiddenException('Cannot access this user');
        }
        return user;
    }
    async update(id, dto, actor) {
        const user = await this.prisma.user.findFirst({
            where: { id, schoolId: actor.schoolId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isManager = isActorManager(actor);
        const canManage = canManageUsers(actor);
        const isSelf = actor.sub === id;
        if (!canManage && !isSelf) {
            throw new common_1.ForbiddenException('Cannot update this user');
        }
        if (!canManage) {
            if (dto.role !== undefined || dto.status !== undefined || dto.permissions !== undefined) {
                throw new common_1.ForbiddenException('Cannot change role, status, or permissions');
            }
        }
        if (canManage && !isManager && user.role === client_1.UserRole.MANAGER) {
            throw new common_1.ForbiddenException('Cannot update manager accounts');
        }
        if (canManage &&
            !isManager &&
            dto.role === client_1.UserRole.MANAGER) {
            throw new common_1.ForbiddenException('Only managers can promote users to manager');
        }
        if (canManage &&
            !isManager &&
            dto.permissions?.includes(client_1.UserPermission.USER_MANAGEMENT)) {
            throw new common_1.ForbiddenException('Only managers can grant user management permission');
        }
        const nextRole = canManage && dto.role !== undefined ? dto.role : user.role;
        const nextPermissions = canManage && dto.permissions !== undefined
            ? resolvePermissions(nextRole, dto.permissions)
            : canManage && dto.role !== undefined
                ? resolvePermissions(nextRole)
                : undefined;
        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                ...(dto.firstName !== undefined && { firstName: dto.firstName }),
                ...(dto.lastName !== undefined && { lastName: dto.lastName }),
                ...(dto.phone !== undefined && { phone: dto.phone }),
                ...(canManage && dto.role !== undefined && { role: dto.role }),
                ...(nextPermissions !== undefined && {
                    permissions: { set: nextPermissions },
                }),
                ...(canManage && dto.status !== undefined && { status: dto.status }),
            },
            select: userSelect,
        });
        return updated;
    }
    async approve(id, dto, actor) {
        if (!canManageUsers(actor)) {
            throw new common_1.ForbiddenException('You do not have permission to approve users');
        }
        if (dto.permissions?.includes(client_1.UserPermission.USER_MANAGEMENT) &&
            !isActorManager(actor)) {
            throw new common_1.ForbiddenException('Only managers can grant user management permission');
        }
        const user = await this.prisma.user.findFirst({
            where: { id, schoolId: actor.schoolId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.status !== client_1.UserStatus.PENDING) {
            throw new common_1.ConflictException('User is not pending approval');
        }
        const nextPermissions = dto.permissions !== undefined
            ? resolvePermissions(user.role, dto.permissions)
            : undefined;
        return this.prisma.user.update({
            where: { id },
            data: {
                status: client_1.UserStatus.ACTIVE,
                ...(nextPermissions !== undefined && {
                    permissions: { set: nextPermissions },
                }),
            },
            select: userSelect,
        });
    }
    async deactivate(id, actor) {
        if (!canManageUsers(actor)) {
            throw new common_1.ForbiddenException('You do not have permission to deactivate users');
        }
        if (actor.sub === id) {
            throw new common_1.ForbiddenException('Cannot deactivate your own account');
        }
        const user = await this.prisma.user.findFirst({
            where: { id, schoolId: actor.schoolId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!isActorManager(actor) && user.role === client_1.UserRole.MANAGER) {
            throw new common_1.ForbiddenException('Cannot deactivate manager accounts');
        }
        return this.prisma.user.update({
            where: { id },
            data: { status: client_1.UserStatus.INACTIVE },
            select: userSelect,
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map