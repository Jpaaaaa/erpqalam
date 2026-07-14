import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserPermission } from '@generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { hasPermission } from '../common/permissions/user-permissions';
import {
  ListStudentsQueryDto,
  PaginatedStudentsResponseDto,
  StudentResponseDto,
  UpdateStudentDto,
} from './dto/students.dto';
import {
  UpdateStudentDetailsDto,
  buildDetailsUpdateData,
  toStudentDetailsFields,
} from './dto/student-details.dto';
import { syncPhoneNumbersFromDetails } from './student-details.util';
import { buildStudentListWhere } from './student-list-filters.util';

const registeredBySelect = {
  id: true,
  firstName: true,
  lastName: true,
} as const;

const studentInclude = {
  registeredBy: {
    select: registeredBySelect,
  },
} as const;

function toStudentResponse(
  student: {
    id: string;
    firstName: string;
    secondName: string;
    thirdName: string | null;
    fourthName: string | null;
    section: string;
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
    registeredByUserId: string | null;
    registeredAt: Date | null;
    pendingStudentId: string | null;
    createdAt: Date;
    updatedAt: Date;
    registeredBy?: {
      id: string;
      firstName: string;
      lastName: string;
    } | null;
  },
): StudentResponseDto {
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
    ...toStudentDetailsFields(student),
    schoolId: student.schoolId,
    registeredByUserId: student.registeredByUserId,
    registeredBy: student.registeredBy ?? null,
    registeredAt: student.registeredAt,
    pendingStudentId: student.pendingStudentId,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
  };
}

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    actor: JwtPayload,
    query: ListStudentsQueryDto,
  ): Promise<PaginatedStudentsResponseDto> {
    if (!hasPermission(actor.role, actor.permissions, UserPermission.STUDENT_REGISTRATION)) {
      throw new ForbiddenException('You do not have permission to list students');
    }

    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;
    const where = buildStudentListWhere(actor.schoolId, query);

    const [data, total] = await this.prisma.withConnectionRetry(() =>
      Promise.all([
        this.prisma.student.findMany({
          where,
          include: studentInclude,
          skip,
          take: limit,
          orderBy: { registeredAt: 'desc' },
        }),
        this.prisma.student.count({ where }),
      ]),
    );

    return {
      data: data.map(toStudentResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async updateDetails(
    id: string,
    dto: UpdateStudentDetailsDto,
    actor: JwtPayload,
  ): Promise<StudentResponseDto> {
    if (!hasPermission(actor.role, actor.permissions, UserPermission.STUDENT_REGISTRATION)) {
      throw new ForbiddenException('You do not have permission to update students');
    }

    const existing = await this.prisma.student.findFirst({
      where: { id, schoolId: actor.schoolId },
    });

    if (!existing) {
      throw new NotFoundException('Student not found');
    }

    const phoneNumbers = syncPhoneNumbersFromDetails(existing.phoneNumbers, dto);

    const student = await this.prisma.student.update({
      where: { id },
      data: {
        ...buildDetailsUpdateData(dto),
        ...(phoneNumbers !== undefined && { phoneNumbers }),
      },
      include: studentInclude,
    });

    return toStudentResponse(student);
  }

  async update(
    id: string,
    dto: UpdateStudentDto,
    actor: JwtPayload,
  ): Promise<StudentResponseDto> {
    if (!hasPermission(actor.role, actor.permissions, UserPermission.STUDENT_REGISTRATION)) {
      throw new ForbiddenException('You do not have permission to update students');
    }

    const existing = await this.prisma.student.findFirst({
      where: { id, schoolId: actor.schoolId },
    });

    if (!existing) {
      throw new NotFoundException('Student not found');
    }

    const data: {
      firstName?: string;
      secondName?: string;
      thirdName?: string | null;
      fourthName?: string | null;
      section?: string;
    } = {};

    if (dto.firstName !== undefined) {
      data.firstName = dto.firstName.trim();
    }
    if (dto.secondName !== undefined) {
      data.secondName = dto.secondName.trim();
    }
    if (dto.thirdName !== undefined) {
      data.thirdName = dto.thirdName.trim() || null;
    }
    if (dto.fourthName !== undefined) {
      data.fourthName = dto.fourthName.trim() || null;
    }
    if (dto.section !== undefined) {
      data.section = dto.section.trim();
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('At least one field is required');
    }

    const student = await this.prisma.student.update({
      where: { id },
      data,
      include: studentInclude,
    });

    return toStudentResponse(student);
  }
}

export { toStudentResponse, studentInclude, registeredBySelect };
