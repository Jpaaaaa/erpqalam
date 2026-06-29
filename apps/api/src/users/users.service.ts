import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserPermission, UserRole, UserStatus } from '@generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { hasPermission } from '../common/permissions/user-permissions';
import {
  CreateUserDto,
  ListUsersQueryDto,
  PaginatedUsersResponseDto,
  ApproveUserDto,
  UpdateUserDto,
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

function resolvePermissions(
  role: UserRole,
  permissions?: UserPermission[] | null,
): UserPermission[] {
  if (role === UserRole.MANAGER) {
    return [];
  }

  return permissions ?? [];
}

function canManageUsers(actor: JwtPayload): boolean {
  return hasPermission(actor.role, actor.permissions, UserPermission.USER_MANAGEMENT);
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

    if (
      dto.permissions?.includes(UserPermission.USER_MANAGEMENT) &&
      !isActorManager(actor)
    ) {
      throw new ForbiddenException(
        'Only managers can grant user management permission',
      );
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
        permissions: resolvePermissions(dto.role, dto.permissions),
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
      if (dto.role !== undefined || dto.status !== undefined || dto.permissions !== undefined) {
        throw new ForbiddenException('Cannot change role, status, or permissions');
      }
    }

    if (canManage && !isManager && user.role === UserRole.MANAGER) {
      throw new ForbiddenException('Cannot update manager accounts');
    }

    if (
      canManage &&
      !isManager &&
      dto.role === UserRole.MANAGER
    ) {
      throw new ForbiddenException('Only managers can promote users to manager');
    }

    if (
      canManage &&
      !isManager &&
      dto.permissions?.includes(UserPermission.USER_MANAGEMENT)
    ) {
      throw new ForbiddenException(
        'Only managers can grant user management permission',
      );
    }

    const nextRole = canManage && dto.role !== undefined ? dto.role : user.role;
    const nextPermissions =
      canManage && dto.permissions !== undefined
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

  async approve(
    id: string,
    dto: ApproveUserDto,
    actor: JwtPayload,
  ): Promise<UserResponseDto> {
    if (!canManageUsers(actor)) {
      throw new ForbiddenException('You do not have permission to approve users');
    }

    if (
      dto.permissions?.includes(UserPermission.USER_MANAGEMENT) &&
      !isActorManager(actor)
    ) {
      throw new ForbiddenException(
        'Only managers can grant user management permission',
      );
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

    const nextPermissions =
      dto.permissions !== undefined
        ? resolvePermissions(user.role, dto.permissions)
        : undefined;

    return this.prisma.user.update({
      where: { id },
      data: {
        status: UserStatus.ACTIVE,
        ...(nextPermissions !== undefined && {
          permissions: { set: nextPermissions },
        }),
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
}
