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
  CreateUserDto,
  ListUsersQueryDto,
  PaginatedUsersResponseDto,
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
  status: true,
  schoolId: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    dto: CreateUserDto,
    actor: JwtPayload,
  ): Promise<UserResponseDto> {
    if (actor.role !== UserRole.MANAGER) {
      throw new ForbiddenException('Only managers can create users');
    }

    if (dto.role === UserRole.MANAGER && actor.role !== UserRole.MANAGER) {
      throw new ForbiddenException('Cannot create manager accounts');
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
    if (actor.role !== UserRole.MANAGER) {
      throw new ForbiddenException('Only managers can list users');
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

    if (actor.role !== UserRole.MANAGER && actor.sub !== id) {
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

    const isManager = actor.role === UserRole.MANAGER;
    const isSelf = actor.sub === id;

    if (!isManager && !isSelf) {
      throw new ForbiddenException('Cannot update this user');
    }

    if (!isManager) {
      if (dto.role !== undefined || dto.status !== undefined) {
        throw new ForbiddenException('Cannot change role or status');
      }
    }

    if (isManager && dto.role === UserRole.MANAGER && user.role !== UserRole.MANAGER) {
      // managers can promote - allowed
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(isManager && dto.role !== undefined && { role: dto.role }),
        ...(isManager && dto.status !== undefined && { status: dto.status }),
      },
      select: userSelect,
    });

    return updated;
  }

  async approve(id: string, actor: JwtPayload): Promise<UserResponseDto> {
    if (actor.role !== UserRole.MANAGER) {
      throw new ForbiddenException('Only managers can approve users');
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
      data: { status: UserStatus.ACTIVE },
      select: userSelect,
    });
  }

  async deactivate(id: string, actor: JwtPayload): Promise<UserResponseDto> {
    if (actor.role !== UserRole.MANAGER) {
      throw new ForbiddenException('Only managers can deactivate users');
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

    return this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.INACTIVE },
      select: userSelect,
    });
  }
}
