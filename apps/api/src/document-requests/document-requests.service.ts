import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import {
  CreateDocumentRequestDto,
  DocumentRequestLetterResponseDto,
  DocumentRequestSettingsResponseDto,
  ListDocumentRequestsQueryDto,
  PaginatedDocumentRequestsResponseDto,
  UpdateDocumentRequestSettingsDto,
} from './dto/document-requests.dto';
import {
  buildDocumentRequestPdf,
  getAcademicYear,
} from './document-request-pdf.service';

const staffSelect = {
  id: true,
  firstName: true,
  lastName: true,
} as const;

function formatStudentFullName(row: {
  firstName: string;
  secondName: string;
  thirdName: string | null;
  fourthName: string | null;
}): string {
  return [
    row.firstName,
    row.secondName,
    row.thirdName,
    row.fourthName,
  ]
    .filter(Boolean)
    .join(' ');
}

function toLetterResponse(row: {
  id: string;
  documentNumber: string;
  documentDate: Date;
  studentFullName: string;
  previousSchoolName: string;
  studentId: string | null;
  pendingStudentId: string | null;
  createdAt: Date;
  generatedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}): DocumentRequestLetterResponseDto {
  return {
    id: row.id,
    documentNumber: row.documentNumber,
    documentDate: row.documentDate.toISOString().slice(0, 10),
    studentFullName: row.studentFullName,
    previousSchoolName: row.previousSchoolName,
    studentId: row.studentId,
    pendingStudentId: row.pendingStudentId,
    generatedBy: row.generatedBy,
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class DocumentRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureSettings(schoolId: string) {
    return this.prisma.documentRequestSettings.upsert({
      where: { schoolId },
      create: { schoolId },
      update: {},
    });
  }

  private toSettingsResponse(settings: {
    prefix: string;
    nextNumber: number;
  }): DocumentRequestSettingsResponseDto {
    return {
      prefix: settings.prefix,
      nextNumber: settings.nextNumber,
      nextDocumentNumber: `${settings.prefix}${settings.nextNumber}`,
    };
  }

  async getSettings(
    user: JwtPayload,
  ): Promise<DocumentRequestSettingsResponseDto> {
    const settings = await this.ensureSettings(user.schoolId);
    return this.toSettingsResponse(settings);
  }

  async updateSettings(
    user: JwtPayload,
    dto: UpdateDocumentRequestSettingsDto,
  ): Promise<DocumentRequestSettingsResponseDto> {
    await this.ensureSettings(user.schoolId);

    const settings = await this.prisma.documentRequestSettings.update({
      where: { schoolId: user.schoolId },
      data: {
        ...(dto.prefix !== undefined ? { prefix: dto.prefix.trim() } : {}),
        ...(dto.nextNumber !== undefined ? { nextNumber: dto.nextNumber } : {}),
      },
    });

    return this.toSettingsResponse(settings);
  }

  async findAll(
    user: JwtPayload,
    query: ListDocumentRequestsQueryDto,
  ): Promise<PaginatedDocumentRequestsResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const hasStudent = Boolean(query.studentId);
    const hasPending = Boolean(query.pendingStudentId);

    if (hasStudent && hasPending) {
      throw new BadRequestException(
        'Provide at most one of studentId or pendingStudentId',
      );
    }

    const where = {
      schoolId: user.schoolId,
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.pendingStudentId
        ? { pendingStudentId: query.pendingStudentId }
        : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.documentRequestLetter.findMany({
        where,
        include: { generatedBy: { select: staffSelect } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.documentRequestLetter.count({ where }),
    ]);

    return {
      data: rows.map(toLetterResponse),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  private async resolveManagerName(schoolId: string): Promise<string> {
    const manager = await this.prisma.user.findFirst({
      where: { schoolId, role: UserRole.MANAGER, status: 'ACTIVE' },
      select: { firstName: true, lastName: true },
    });

    if (!manager) {
      return 'مدير المعهد';
    }

    return `${manager.firstName} ${manager.lastName}`;
  }

  async create(
    user: JwtPayload,
    dto: CreateDocumentRequestDto,
  ): Promise<{ pdf: Buffer; letter: DocumentRequestLetterResponseDto }> {
    const hasStudent = Boolean(dto.studentId);
    const hasPending = Boolean(dto.pendingStudentId);

    if (hasStudent === hasPending) {
      throw new BadRequestException(
        'Provide exactly one of studentId or pendingStudentId',
      );
    }

    const previousSchoolName = dto.previousSchoolName.trim();
    if (!previousSchoolName) {
      throw new BadRequestException('Previous school name is required');
    }

    let studentFullName: string;

    if (dto.studentId) {
      const student = await this.prisma.student.findFirst({
        where: { id: dto.studentId, schoolId: user.schoolId },
      });
      if (!student) {
        throw new NotFoundException('Student not found');
      }
      studentFullName = formatStudentFullName(student);
    } else {
      const pending = await this.prisma.pendingStudent.findFirst({
        where: { id: dto.pendingStudentId!, schoolId: user.schoolId },
      });
      if (!pending) {
        throw new NotFoundException('Pending student not found');
      }
      studentFullName = formatStudentFullName(pending);
    }

    const documentDate = new Date();
    documentDate.setHours(0, 0, 0, 0);

    const school = await this.prisma.school.findUniqueOrThrow({
      where: { id: user.schoolId },
    });

    const managerName = await this.resolveManagerName(user.schoolId);

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.documentRequestSettings.upsert({
        where: { schoolId: user.schoolId },
        create: { schoolId: user.schoolId },
        update: {},
      });

      const settings = await tx.documentRequestSettings.update({
        where: { schoolId: user.schoolId },
        data: { nextNumber: { increment: 1 } },
      });

      const assignedNumber = settings.nextNumber - 1;
      const documentNumber = `${settings.prefix}${assignedNumber}`;

      const letter = await tx.documentRequestLetter.create({
        data: {
          schoolId: user.schoolId,
          documentNumber,
          documentDate,
          studentFullName,
          previousSchoolName,
          studentId: dto.studentId ?? null,
          pendingStudentId: dto.pendingStudentId ?? null,
          generatedByUserId: user.sub,
        },
        include: { generatedBy: { select: staffSelect } },
      });

      return { letter, documentNumber };
    });

    const pdf = await buildDocumentRequestPdf({
      schoolName: school.name,
      previousSchoolName,
      documentNumber: result.documentNumber,
      documentDate,
      studentFullName,
      academicYear: getAcademicYear(documentDate),
      managerName,
    });

    return {
      pdf,
      letter: toLetterResponse(result.letter),
    };
  }

  async getPdf(
    user: JwtPayload,
    id: string,
  ): Promise<{ pdf: Buffer; letter: DocumentRequestLetterResponseDto }> {
    const letter = await this.prisma.documentRequestLetter.findFirst({
      where: { id, schoolId: user.schoolId },
      include: { generatedBy: { select: staffSelect } },
    });

    if (!letter) {
      throw new NotFoundException('Document request letter not found');
    }

    const school = await this.prisma.school.findUniqueOrThrow({
      where: { id: user.schoolId },
    });

    const managerName = await this.resolveManagerName(user.schoolId);
    const documentDate = new Date(letter.documentDate);

    const pdf = await buildDocumentRequestPdf({
      schoolName: school.name,
      previousSchoolName: letter.previousSchoolName,
      documentNumber: letter.documentNumber,
      documentDate,
      studentFullName: letter.studentFullName,
      academicYear: getAcademicYear(documentDate),
      managerName,
    });

    return {
      pdf,
      letter: toLetterResponse(letter),
    };
  }
}
