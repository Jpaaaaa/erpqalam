import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserPermission } from '@generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { hasPermission } from '../common/permissions/user-permissions';
import {
  CreatePendingStudentCheckInDto,
  CreatePendingStudentDto,
  ListPendingStudentsQueryDto,
  PaginatedPendingStudentsResponseDto,
  PendingStudentResponseDto,
  UpdatePendingStudentDto,
} from './dto/pending-students.dto';
import {
  UpdateStudentDetailsDto,
  buildDetailsUpdateData,
  toStudentDetailsFields,
} from './dto/student-details.dto';
import {
  copyStudentDetailsFromPending,
  syncPhoneNumbersFromDetails,
} from './student-details.util';

const staffSelect = {
  id: true,
  firstName: true,
  lastName: true,
} as const;

const pendingInclude = {
  submittedBy: {
    select: staffSelect,
  },
} as const;

const REQUIRED_PHONE_COUNT = 2;

function normalizePhones(phones: string[]): string[] {
  const normalized = phones.map((phone) => phone.trim()).filter(Boolean);
  if (normalized.length !== REQUIRED_PHONE_COUNT) {
    throw new BadRequestException(
      `Exactly ${REQUIRED_PHONE_COUNT} phone numbers are required`,
    );
  }
  return normalized;
}

function toPendingResponse(
  row: {
    id: string;
    firstName: string;
    secondName: string;
    thirdName: string | null;
    fourthName: string | null;
    section: string | null;
    phoneNumbers: string[];
    guardianInfo: string | null;
    comeViaWho: string | null;
    homeAddress: string | null;
    birthPlace: string | null;
    birthDate: Date | null;
    nationalIdNumber: string | null;
    residenceCardNumber: string | null;
    foodRationCardNumber: string | null;
    guardianName: string | null;
    guardianMobile: string | null;
    stage: string | null;
    detailsCompletedAt: Date | null;
    schoolId: string;
    submittedByUserId: string | null;
    createdAt: Date;
    updatedAt: Date;
    submittedBy?: {
      id: string;
      firstName: string;
      lastName: string;
    } | null;
  },
): PendingStudentResponseDto {
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
    ...toStudentDetailsFields(row),
    schoolId: row.schoolId,
    submittedByUserId: row.submittedByUserId,
    submittedBy: row.submittedBy ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

@Injectable()
export class PendingStudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createCheckIn(
    dto: CreatePendingStudentCheckInDto,
  ): Promise<PendingStudentResponseDto> {
    const school = await this.prisma.school.findUnique({
      where: { code: dto.schoolCode },
    });

    if (!school) {
      throw new NotFoundException('Invalid school code');
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

  async create(
    dto: CreatePendingStudentDto,
    actor: JwtPayload,
  ): Promise<PendingStudentResponseDto> {
    if (!hasPermission(actor.role, actor.permissions, UserPermission.STUDENT_REGISTRATION)) {
      throw new ForbiddenException('You do not have permission to add pending students');
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

  async findAll(
    actor: JwtPayload,
    query: ListPendingStudentsQueryDto,
  ): Promise<PaginatedPendingStudentsResponseDto> {
    if (!hasPermission(actor.role, actor.permissions, UserPermission.STUDENT_REGISTRATION)) {
      throw new ForbiddenException('You do not have permission to list pending students');
    }

    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;
    const where = { schoolId: actor.schoolId };

    const [data, total] = await this.prisma.withConnectionRetry(() =>
      Promise.all([
        this.prisma.pendingStudent.findMany({
          where,
          include: pendingInclude,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.pendingStudent.count({ where }),
      ]),
    );

    return {
      data: data.map(toPendingResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async update(
    id: string,
    dto: UpdatePendingStudentDto,
    actor: JwtPayload,
  ): Promise<PendingStudentResponseDto> {
    if (!hasPermission(actor.role, actor.permissions, UserPermission.STUDENT_REGISTRATION)) {
      throw new ForbiddenException('You do not have permission to update pending students');
    }

    const existing = await this.prisma.pendingStudent.findFirst({
      where: { id, schoolId: actor.schoolId },
    });

    if (!existing) {
      throw new NotFoundException('Pending student not found');
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

  async updateDetails(
    id: string,
    dto: UpdateStudentDetailsDto,
    actor: JwtPayload,
  ): Promise<PendingStudentResponseDto> {
    if (!hasPermission(actor.role, actor.permissions, UserPermission.STUDENT_REGISTRATION)) {
      throw new ForbiddenException('You do not have permission to update pending students');
    }

    const existing = await this.prisma.pendingStudent.findFirst({
      where: { id, schoolId: actor.schoolId },
    });

    if (!existing) {
      throw new NotFoundException('Pending student not found');
    }

    const phoneNumbers = syncPhoneNumbersFromDetails(existing.phoneNumbers, dto);

    const row = await this.prisma.pendingStudent.update({
      where: { id },
      data: {
        ...buildDetailsUpdateData(dto),
        ...(phoneNumbers !== undefined && { phoneNumbers }),
      },
      include: pendingInclude,
    });

    return toPendingResponse(row);
  }

  private assertReadyForApproval(pending: {
    section: string | null;
    phoneNumbers: string[];
  }) {
    if (!pending.section?.trim()) {
      throw new BadRequestException('Section is required before approval');
    }

    if (pending.phoneNumbers.length !== REQUIRED_PHONE_COUNT) {
      throw new BadRequestException(
        `Exactly ${REQUIRED_PHONE_COUNT} phone numbers are required before approval`,
      );
    }
  }

  async approve(id: string, actor: JwtPayload) {
    if (!hasPermission(actor.role, actor.permissions, UserPermission.STUDENT_REGISTRATION)) {
      throw new ForbiddenException('You do not have permission to approve students');
    }

    const pending = await this.prisma.pendingStudent.findFirst({
      where: { id, schoolId: actor.schoolId },
    });

    if (!pending) {
      throw new NotFoundException('Pending student not found');
    }

    this.assertReadyForApproval(pending);

    return this.prisma.$transaction(async (tx) => {
      const student = await tx.student.create({
        data: {
          firstName: pending.firstName,
          secondName: pending.secondName,
          thirdName: pending.thirdName,
          fourthName: pending.fourthName,
          section: pending.section!.trim(),
          phoneNumbers: pending.phoneNumbers,
          guardianInfo: pending.guardianInfo,
          comeViaWho: pending.comeViaWho,
          ...copyStudentDetailsFromPending(pending),
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
}
