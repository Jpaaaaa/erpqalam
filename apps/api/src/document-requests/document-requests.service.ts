import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import {
  CheckDocumentNumberQueryDto,
  CheckDocumentNumberResponseDto,
  CreateDocumentRequestDto,
  DocumentRequestCreateDefaultsResponseDto,
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
import { DocumentRequestTemplateStorage } from './document-request-template.storage';
import {
  assertValidLetterheadPdf,
  type UploadedPdfFile,
} from './document-request-template.util';
import {
  parseBodyTemplateFields,
  serializeBodyTemplate,
} from './body-template.util';
import {
  normalizeDocumentRequestLanguage,
  type DocumentRequestLanguage,
} from './document-request-language';
import {
  formatStudentSectionLabel,
} from '../students/section-labels';

const staffSelect = {
  id: true,
  firstName: true,
  lastName: true,
} as const;

const ACADEMIC_YEAR_PATTERN = /^\d{4}-\d{4}$/;

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

function parseDocumentNumberSuffix(
  documentNumber: string,
  prefix: string,
): number | null {
  if (!documentNumber.startsWith(prefix)) {
    return null;
  }

  const suffix = documentNumber.slice(prefix.length);
  if (!/^\d+$/.test(suffix)) {
    return null;
  }

  const parsed = Number.parseInt(suffix, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveAcademicYear(
  provided: string | undefined,
  savedDefault: string | null | undefined,
  documentDate: Date,
): string {
  const trimmed = provided?.trim();
  if (trimmed) {
    if (!ACADEMIC_YEAR_PATTERN.test(trimmed)) {
      throw new BadRequestException(
        'academicYear must be in YYYY-YYYY format',
      );
    }
    return trimmed;
  }

  if (savedDefault?.trim()) {
    return savedDefault.trim();
  }

  return getAcademicYear(documentDate);
}

@Injectable()
export class DocumentRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly templateStorage: DocumentRequestTemplateStorage,
  ) {}

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
    defaultAcademicYear: string | null;
    bodyTemplate: string;
    letterheadTemplateFileName: string | null;
    letterheadTemplateUploadedAt: Date | null;
  }): DocumentRequestSettingsResponseDto {
    return {
      prefix: settings.prefix,
      nextNumber: settings.nextNumber,
      nextDocumentNumber: `${settings.prefix}${settings.nextNumber}`,
      defaultAcademicYear: settings.defaultAcademicYear,
      bodyParagraph: parseBodyTemplateFields(settings.bodyTemplate),
      hasCustomLetterheadTemplate: Boolean(settings.letterheadTemplateFileName),
      letterheadTemplateFileName: settings.letterheadTemplateFileName,
      letterheadTemplateUploadedAt:
        settings.letterheadTemplateUploadedAt?.toISOString() ?? null,
    };
  }

  private resolveTemplateBytes(schoolId: string): Buffer | undefined {
    return this.templateStorage.read(schoolId) ?? undefined;
  }

  async getSettings(
    user: JwtPayload,
  ): Promise<DocumentRequestSettingsResponseDto> {
    const settings = await this.ensureSettings(user.schoolId);
    return this.toSettingsResponse(settings);
  }

  async uploadLetterheadTemplate(
    user: JwtPayload,
    file: UploadedPdfFile,
  ): Promise<DocumentRequestSettingsResponseDto> {
    await assertValidLetterheadPdf(file);

    await this.ensureSettings(user.schoolId);
    this.templateStorage.write(user.schoolId, file.buffer);

    const settings = await this.prisma.documentRequestSettings.update({
      where: { schoolId: user.schoolId },
      data: {
        letterheadTemplateFileName: file.originalname.trim() || 'template.pdf',
        letterheadTemplateUploadedAt: new Date(),
      },
    });

    return this.toSettingsResponse(settings);
  }

  async getLetterheadTemplate(
    user: JwtPayload,
  ): Promise<{ bytes: Buffer; fileName: string }> {
    const settings = await this.ensureSettings(user.schoolId);
    const bytes = this.templateStorage.read(user.schoolId);

    if (!bytes || !settings.letterheadTemplateFileName) {
      throw new NotFoundException('Letterhead template not found');
    }

    return {
      bytes,
      fileName: settings.letterheadTemplateFileName,
    };
  }

  async deleteLetterheadTemplate(
    user: JwtPayload,
  ): Promise<DocumentRequestSettingsResponseDto> {
    await this.ensureSettings(user.schoolId);
    this.templateStorage.delete(user.schoolId);

    const settings = await this.prisma.documentRequestSettings.update({
      where: { schoolId: user.schoolId },
      data: {
        letterheadTemplateFileName: null,
        letterheadTemplateUploadedAt: null,
      },
    });

    return this.toSettingsResponse(settings);
  }

  async getCreateDefaults(
    user: JwtPayload,
  ): Promise<DocumentRequestCreateDefaultsResponseDto> {
    const settings = await this.ensureSettings(user.schoolId);
    const documentDate = new Date();
    documentDate.setHours(0, 0, 0, 0);

    return {
      prefix: settings.prefix,
      nextNumber: settings.nextNumber,
      nextDocumentNumber: `${settings.prefix}${settings.nextNumber}`,
      academicYear: resolveAcademicYear(
        undefined,
        settings.defaultAcademicYear,
        documentDate,
      ),
    };
  }

  async checkDocumentNumber(
    user: JwtPayload,
    query: CheckDocumentNumberQueryDto,
  ): Promise<CheckDocumentNumberResponseDto> {
    const documentNumber = query.documentNumber.trim();
    if (!documentNumber) {
      throw new BadRequestException('documentNumber is required');
    }

    const existing = await this.prisma.documentRequestLetter.findFirst({
      where: { schoolId: user.schoolId, documentNumber },
      select: { id: true },
    });

    return { exists: Boolean(existing) };
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
        ...(dto.bodyParagraph !== undefined
          ? { bodyTemplate: serializeBodyTemplate(dto.bodyParagraph) }
          : {}),
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

  private async resolveStudentSectionLabel(params: {
    studentId: string | null;
    pendingStudentId: string | null;
    schoolId: string;
    language: DocumentRequestLanguage;
  }): Promise<string> {
    if (params.studentId) {
      const student = await this.prisma.student.findFirst({
        where: { id: params.studentId, schoolId: params.schoolId },
        select: { section: true },
      });
      return formatStudentSectionLabel(student?.section, params.language);
    }

    if (params.pendingStudentId) {
      const pending = await this.prisma.pendingStudent.findFirst({
        where: { id: params.pendingStudentId, schoolId: params.schoolId },
        select: { section: true },
      });
      return formatStudentSectionLabel(pending?.section, params.language);
    }

    return '';
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

    const language = normalizeDocumentRequestLanguage(dto.language);

    let studentFullName: string;
    let studentSectionLabel: string;

    if (dto.studentId) {
      const student = await this.prisma.student.findFirst({
        where: { id: dto.studentId, schoolId: user.schoolId },
      });
      if (!student) {
        throw new NotFoundException('Student not found');
      }
      studentFullName = formatStudentFullName(student);
      studentSectionLabel = formatStudentSectionLabel(student.section, language);
    } else {
      const pending = await this.prisma.pendingStudent.findFirst({
        where: { id: dto.pendingStudentId!, schoolId: user.schoolId },
      });
      if (!pending) {
        throw new NotFoundException('Pending student not found');
      }
      studentFullName = formatStudentFullName(pending);
      studentSectionLabel = formatStudentSectionLabel(pending.section, language);
    }

    if (!studentSectionLabel) {
      throw new BadRequestException(
        'Student section is required before generating a document request',
      );
    }

    const documentDate = new Date();
    documentDate.setHours(0, 0, 0, 0);

    const school = await this.prisma.school.findUniqueOrThrow({
      where: { id: user.schoolId },
    });

    const settingsBefore = await this.ensureSettings(user.schoolId);
    const academicYear = resolveAcademicYear(
      dto.academicYear,
      settingsBefore.defaultAcademicYear,
      documentDate,
    );

    const customDocumentNumber = dto.documentNumber?.trim();

    const result = await this.prisma.$transaction(async (tx) => {
      await tx.documentRequestSettings.upsert({
        where: { schoolId: user.schoolId },
        create: { schoolId: user.schoolId },
        update: {},
      });

      const currentSettings = await tx.documentRequestSettings.findUniqueOrThrow(
        {
          where: { schoolId: user.schoolId },
        },
      );

      let documentNumber: string;

      if (customDocumentNumber) {
        documentNumber = customDocumentNumber;

        const existing = await tx.documentRequestLetter.findFirst({
          where: {
            schoolId: user.schoolId,
            documentNumber,
          },
          select: { id: true },
        });

        if (existing) {
          throw new ConflictException(
            `Document number ${documentNumber} is already in use`,
          );
        }

        const suffix = parseDocumentNumberSuffix(
          documentNumber,
          currentSettings.prefix,
        );

        if (suffix !== null && suffix >= currentSettings.nextNumber) {
          await tx.documentRequestSettings.update({
            where: { schoolId: user.schoolId },
            data: { nextNumber: suffix + 1 },
          });
        }
      } else {
        const settings = await tx.documentRequestSettings.update({
          where: { schoolId: user.schoolId },
          data: { nextNumber: { increment: 1 } },
        });

        const assignedNumber = settings.nextNumber - 1;
        documentNumber = `${settings.prefix}${assignedNumber}`;
      }

      await tx.documentRequestSettings.update({
        where: { schoolId: user.schoolId },
        data: { defaultAcademicYear: academicYear },
      });

      const letter = await tx.documentRequestLetter.create({
        data: {
          schoolId: user.schoolId,
          documentNumber,
          documentDate,
          academicYear,
          language,
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
      academicYear,
      studentSectionLabel,
      bodyTemplate: settingsBefore.bodyTemplate,
      language,
      templateBytes: this.resolveTemplateBytes(user.schoolId),
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

    const documentDate = new Date(letter.documentDate);
    const settings = await this.ensureSettings(user.schoolId);
    const language = normalizeDocumentRequestLanguage(letter.language);
    const studentSectionLabel = await this.resolveStudentSectionLabel({
      studentId: letter.studentId,
      pendingStudentId: letter.pendingStudentId,
      schoolId: user.schoolId,
      language,
    });

    const academicYear =
      letter.academicYear?.trim() || getAcademicYear(documentDate);

    const pdf = await buildDocumentRequestPdf({
      schoolName: school.name,
      previousSchoolName: letter.previousSchoolName,
      documentNumber: letter.documentNumber,
      documentDate,
      studentFullName: letter.studentFullName,
      academicYear,
      studentSectionLabel,
      bodyTemplate: settings.bodyTemplate,
      language,
      templateBytes: this.resolveTemplateBytes(user.schoolId),
    });

    return {
      pdf,
      letter: toLetterResponse(letter),
    };
  }
}
