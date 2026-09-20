import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { hasPermission, PERMISSIONS } from '../common/permissions/permissions';
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
import { StudentAuditLogEntryDto } from './dto/student-audit.dto';
import { repointPendingStudentLinksOnApprove } from './student-record-repoint.util';
import {
  computeCreateAuditChanges,
  computeUpdatePendingStudentDtoChanges,
  computeUpdateStudentDetailsDtoChanges,
  toStudentAuditLogEntries,
  toStudentAuditSource,
  writeStudentAuditLog,
} from './student-audit.util';
import {
  buildPendingListWhere,
  phoneIlikePattern,
} from './pending-student-list-filters.util';

const staffSelect = {
  id: true,
  firstName: true,
  lastName: true,
} as const;

const pendingInclude = {
  submittedBy: {
    select: staffSelect,
  },
  restoredBy: {
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
    restoredById: string | null;
    restoredAt: Date | null;
    restoreReason: string | null;
    originalStudentId: string | null;
    createdAt: Date;
    updatedAt: Date;
    submittedBy?: {
      id: string;
      firstName: string;
      lastName: string;
    } | null;
    restoredBy?: {
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
    restoredById: row.restoredById,
    restoredBy: row.restoredBy ?? null,
    restoredAt: row.restoredAt,
    restoreReason: row.restoreReason,
    originalStudentId: row.originalStudentId,
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
    if (!hasPermission(actor.role, actor.permissions, PERMISSIONS.REGISTRATION_MANAGE)) {
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
    if (!hasPermission(actor.role, actor.permissions, PERMISSIONS.REGISTRATION_VIEW)) {
      throw new ForbiddenException('You do not have permission to list pending students');
    }

    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 25, 100);
    const skip = (page - 1) * limit;
    const search = query.search?.trim();

    const [data, total] = await this.prisma.withConnectionRetry(async () => {
      let phoneMatchIds: string[] = [];
      if (search) {
        const phoneRows = await this.prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "PendingStudent"
          WHERE "schoolId" = ${actor.schoolId}
            AND array_to_string("phoneNumbers", ' ') ILIKE ${phoneIlikePattern(search)}
        `;
        phoneMatchIds = phoneRows.map((row) => row.id);
      }

      const where = buildPendingListWhere(actor.schoolId, query, phoneMatchIds);

      return Promise.all([
        this.prisma.pendingStudent.findMany({
          where,
          include: pendingInclude,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.pendingStudent.count({ where }),
      ]);
    });

    return {
      data: data.map(toPendingResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getAuditLog(
    id: string,
    actor: JwtPayload,
  ): Promise<StudentAuditLogEntryDto[]> {
    if (!hasPermission(actor.role, actor.permissions, PERMISSIONS.REGISTRATION_VIEW)) {
      throw new ForbiddenException('You do not have permission to view pending students');
    }

    const pending = await this.prisma.pendingStudent.findFirst({
      where: { id, schoolId: actor.schoolId },
      select: { id: true },
    });

    if (!pending) {
      throw new NotFoundException('Pending student not found');
    }

    const rows = await this.prisma.studentAuditLog.findMany({
      where: { pendingStudentId: id, schoolId: actor.schoolId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        action: true,
        changedByName: true,
        createdAt: true,
        changes: true,
      },
    });

    return toStudentAuditLogEntries(rows);
  }

  async update(
    id: string,
    dto: UpdatePendingStudentDto,
    actor: JwtPayload,
  ): Promise<PendingStudentResponseDto> {
    if (!hasPermission(actor.role, actor.permissions, PERMISSIONS.REGISTRATION_MANAGE)) {
      throw new ForbiddenException('You do not have permission to update pending students');
    }

    const existing = await this.prisma.pendingStudent.findFirst({
      where: { id, schoolId: actor.schoolId },
    });

    if (!existing) {
      throw new NotFoundException('Pending student not found');
    }

    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('At least one field is required');
    }

    const dtoForDiff: UpdatePendingStudentDto = {
      ...dto,
      ...(dto.phoneNumbers !== undefined && {
        phoneNumbers: normalizePhones(dto.phoneNumbers),
      }),
    };

    const changes = computeUpdatePendingStudentDtoChanges(
      toStudentAuditSource(existing),
      dtoForDiff,
    );

    if (changes.length === 0) {
      const unchanged = await this.prisma.pendingStudent.findFirstOrThrow({
        where: { id },
        include: pendingInclude,
      });
      return toPendingResponse(unchanged);
    }

    const row = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.pendingStudent.update({
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

      await writeStudentAuditLog(tx, {
        pendingStudentId: id,
        schoolId: actor.schoolId,
        action: 'UPDATE',
        actor,
        changes,
      });

      return updated;
    });

    return toPendingResponse(row);
  }

  async updateDetails(
    id: string,
    dto: UpdateStudentDetailsDto,
    actor: JwtPayload,
  ): Promise<PendingStudentResponseDto> {
    if (!hasPermission(actor.role, actor.permissions, PERMISSIONS.REGISTRATION_MANAGE)) {
      throw new ForbiddenException('You do not have permission to update pending students');
    }

    const existing = await this.prisma.pendingStudent.findFirst({
      where: { id, schoolId: actor.schoolId },
    });

    if (!existing) {
      throw new NotFoundException('Pending student not found');
    }

    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('At least one field is required');
    }

    const changes = computeUpdateStudentDetailsDtoChanges(
      toStudentAuditSource(existing),
      dto,
    );

    if (changes.length === 0) {
      const unchanged = await this.prisma.pendingStudent.findFirstOrThrow({
        where: { id },
        include: pendingInclude,
      });
      return toPendingResponse(unchanged);
    }

    const phoneNumbers = syncPhoneNumbersFromDetails(existing.phoneNumbers, dto);

    const row = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.pendingStudent.update({
        where: { id },
        data: {
          ...buildDetailsUpdateData(dto),
          ...(phoneNumbers !== undefined && { phoneNumbers }),
        },
        include: pendingInclude,
      });

      await writeStudentAuditLog(tx, {
        pendingStudentId: id,
        schoolId: actor.schoolId,
        action: 'UPDATE',
        actor,
        changes,
      });

      return updated;
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
    if (!hasPermission(actor.role, actor.permissions, PERMISSIONS.REGISTRATION_APPROVE)) {
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

      await repointPendingStudentLinksOnApprove(tx, {
        pendingStudentId: pending.id,
        studentId: student.id,
        schoolId: pending.schoolId,
      });

      await writeStudentAuditLog(tx, {
        studentId: student.id,
        schoolId: pending.schoolId,
        action: 'CREATE',
        actor,
        changes: computeCreateAuditChanges(),
      });

      await tx.pendingStudent.delete({ where: { id: pending.id } });

      return student;
    });
  }

  async remove(id: string, actor: JwtPayload): Promise<void> {
    if (!hasPermission(actor.role, actor.permissions, PERMISSIONS.REGISTRATION_MANAGE)) {
      throw new ForbiddenException('You do not have permission to delete students');
    }

    const existing = await this.prisma.pendingStudent.findFirst({
      where: { id, schoolId: actor.schoolId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Pending student not found');
    }

    await this.prisma.pendingStudent.delete({ where: { id } });
  }
}

export { toPendingResponse, pendingInclude };
