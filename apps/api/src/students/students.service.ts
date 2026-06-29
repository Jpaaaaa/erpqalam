import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StudentStatus, UserRole } from '@generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import {
  CreateStudentPendingDto,
  CreateStudentPendingFullDto,
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
    mobilePrimary: string | null;
    mobileSecondary: string | null;
    comeViaWho: string | null;
    status: StudentStatus;
    schoolId: string;
    registeredByUserId: string | null;
    registeredAt: Date | null;
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
    mobilePrimary: student.mobilePrimary,
    mobileSecondary: student.mobileSecondary,
    comeViaWho: student.comeViaWho,
    status: student.status,
    schoolId: student.schoolId,
    registeredByUserId: student.registeredByUserId,
    registeredBy: student.registeredBy ?? null,
    registeredAt: student.registeredAt,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt,
  };
}

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPending(dto: CreateStudentPendingDto): Promise<StudentResponseDto> {
    const school = await this.prisma.school.findUnique({
      where: { code: dto.schoolCode },
    });

    if (!school) {
      throw new NotFoundException('Invalid school code');
    }

    const student = await this.prisma.student.create({
      data: {
        firstName: dto.firstName.trim(),
        secondName: dto.secondName.trim(),
        status: StudentStatus.PENDING,
        schoolId: school.id,
      },
      include: studentInclude,
    });

    return toStudentResponse(student);
  }

  async createPendingFull(
    dto: CreateStudentPendingFullDto,
    actor: JwtPayload,
  ): Promise<StudentResponseDto> {
    if (actor.role !== UserRole.MANAGER) {
      throw new ForbiddenException('Only managers can add pending students');
    }

    const student = await this.prisma.student.create({
      data: {
        firstName: dto.firstName.trim(),
        secondName: dto.secondName.trim(),
        thirdName: dto.thirdName?.trim() || null,
        mobilePrimary: dto.mobilePrimary.trim(),
        mobileSecondary: dto.mobileSecondary?.trim() || null,
        comeViaWho: dto.comeViaWho.trim(),
        status: StudentStatus.PENDING,
        schoolId: actor.schoolId,
      },
      include: studentInclude,
    });

    return toStudentResponse(student);
  }

  async findAll(
    actor: JwtPayload,
    query: ListStudentsQueryDto,
  ): Promise<PaginatedStudentsResponseDto> {
    if (actor.role !== UserRole.MANAGER) {
      throw new ForbiddenException('Only managers can list students');
    }

    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where = {
      schoolId: actor.schoolId,
      ...(query.status && { status: query.status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        include: studentInclude,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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

  async register(id: string, actor: JwtPayload): Promise<StudentResponseDto> {
    if (actor.role !== UserRole.MANAGER) {
      throw new ForbiddenException('Only managers can register students');
    }

    const student = await this.prisma.student.findFirst({
      where: { id, schoolId: actor.schoolId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (student.status !== StudentStatus.PENDING) {
      throw new ConflictException('Student is not pending');
    }

    const updated = await this.prisma.student.update({
      where: { id },
      data: {
        status: StudentStatus.REGISTERED,
        registeredByUserId: actor.sub,
        registeredAt: new Date(),
      },
      include: studentInclude,
    });

    return toStudentResponse(updated);
  }
}
