import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole, UserStatus } from '@generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import {
  hasPermission,
  PERMISSIONS,
  resolvePermissions,
  sanitizePermissions,
} from '../common/permissions/permissions';
import {
  CreateUserDto,
  ListUsersQueryDto,
  PaginatedUsersResponseDto,
  ApproveUserDto,
  UpdateUserDto,
  UpdateUserPermissionsDto,
  UserPermissionsResponseDto,
  UserResponseDto,
} from './dto/users.dto';

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
} as const;

const permissionsSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  permissions: true,
} as const;

function canManageUsers(actor: JwtPayload): boolean {
  return hasPermission(actor.role, actor.permissions, PERMISSIONS.USERS_MANAGE);
}

function isActorManager(actor: JwtPayload): boolean {
  return actor.role === UserRole.MANAGER;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateUserDto,
    actor: JwtPayload,
  ): Promise<UserResponseDto> {
    if (!canManageUsers(actor)) {
      throw new ForbiddenException('You do not have permission to create users');
    }

    if (dto.role === UserRole.MANAGER && !isActorManager(actor)) {
      throw new ForbiddenException('Only managers can create manager accounts');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
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
        permissions: resolvePermissions(dto.role, []),
        status: UserStatus.ACTIVE,
        schoolId: actor.schoolId,
      },
      select: userSelect,
    });

    return user;
  }

  async findAll(
    actor: JwtPayload,
    query: ListUsersQueryDto,
  ): Promise<PaginatedUsersResponseDto> {
    if (!canManageUsers(actor)) {
      throw new ForbiddenException('You do not have permission to list users');
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

  async findOne(id: string, actor: JwtPayload): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { id, schoolId: actor.schoolId },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!canManageUsers(actor) && actor.sub !== id) {
      throw new ForbiddenException('Cannot access this user');
    }

    return user;
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    actor: JwtPayload,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { id, schoolId: actor.schoolId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isManager = isActorManager(actor);
    const canManage = canManageUsers(actor);
    const isSelf = actor.sub === id;

    if (!canManage && !isSelf) {
      throw new ForbiddenException('Cannot update this user');
    }

    if (!canManage) {
      if (dto.role !== undefined || dto.status !== undefined) {
        throw new ForbiddenException('Cannot change role or status');
      }
    }

    if (canManage && !isManager && user.role === UserRole.MANAGER) {
      throw new ForbiddenException('Cannot update manager accounts');
    }

    if (canManage && !isManager && dto.role === UserRole.MANAGER) {
      throw new ForbiddenException('Only managers can promote users to manager');
    }

    if (
      isSelf &&
      isManager &&
      dto.role !== undefined &&
      dto.role !== UserRole.MANAGER
    ) {
      throw new ForbiddenException('You cannot demote your own manager account');
    }

    const nextRole = canManage && dto.role !== undefined ? dto.role : user.role;

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(canManage && dto.role !== undefined && { role: dto.role }),
        ...(canManage &&
          dto.role !== undefined &&
          dto.role === UserRole.MANAGER && {
            permissions: { set: [] },
          }),
        ...(canManage && dto.status !== undefined && { status: dto.status }),
      },
      select: userSelect,
    });

    if (nextRole === UserRole.MANAGER) {
      return { ...updated, permissions: [] };
    }

    return updated;
  }

  async approve(
    id: string,
    _dto: ApproveUserDto,
    actor: JwtPayload,
  ): Promise<UserResponseDto> {
    if (!canManageUsers(actor)) {
      throw new ForbiddenException('You do not have permission to approve users');
    }

    const user = await this.prisma.user.findFirst({
      where: { id, schoolId: actor.schoolId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== UserStatus.PENDING) {
      throw new ConflictException('User is not pending approval');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        status: UserStatus.ACTIVE,
      },
      select: userSelect,
    });
  }

  async deactivate(id: string, actor: JwtPayload): Promise<UserResponseDto> {
    if (!canManageUsers(actor)) {
      throw new ForbiddenException('You do not have permission to deactivate users');
    }

    if (actor.sub === id) {
      throw new ForbiddenException('Cannot deactivate your own account');
    }

    const user = await this.prisma.user.findFirst({
      where: { id, schoolId: actor.schoolId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!isActorManager(actor) && user.role === UserRole.MANAGER) {
      throw new ForbiddenException('Cannot deactivate manager accounts');
    }

    return this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.INACTIVE },
      select: userSelect,
    });
  }

  async getPermissions(
    id: string,
    actor: JwtPayload,
  ): Promise<UserPermissionsResponseDto> {
    if (!isActorManager(actor)) {
      throw new ForbiddenException('Only managers can view user permissions');
    }

    const user = await this.prisma.user.findFirst({
      where: { id, schoolId: actor.schoolId },
      select: permissionsSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      permissions: resolvePermissions(user.role, user.permissions),
    };
  }

  async updatePermissions(
    id: string,
    dto: UpdateUserPermissionsDto,
    actor: JwtPayload,
  ): Promise<UserPermissionsResponseDto> {
    if (!isActorManager(actor)) {
      throw new ForbiddenException('Only managers can update user permissions');
    }

    const user = await this.prisma.user.findFirst({
      where: { id, schoolId: actor.schoolId },
      select: permissionsSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.MANAGER) {
      throw new ForbiddenException('Manager permissions cannot be edited');
    }

    const nextPermissions = sanitizePermissions(dto.permissions);

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        permissions: { set: nextPermissions },
      },
      select: permissionsSelect,
    });

    return updated;
  }
}
