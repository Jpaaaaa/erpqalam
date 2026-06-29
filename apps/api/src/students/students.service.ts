import { ForbiddenException, Injectable } from '@nestjs/common';
import { UserPermission } from '@generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { hasPermission } from '../common/permissions/user-permissions';
import {
  ListStudentsQueryDto,
  PaginatedStudentsResponseDto,
  StudentResponseDto,
} from './dto/students.dto';

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
}

export { toStudentResponse, studentInclude, registeredBySelect };
