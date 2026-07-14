import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const ACADEMIC_YEAR_PATTERN = /^\d{4}-\d{4}$/;

export class DocumentRequestBodyParagraphDto {
  @ApiProperty({ example: 'نظراً للقبول الطالب/ة' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  introText: string;

  @ApiProperty({ example: 'في معهدنا' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  afterStudentText: string;

  @ApiProperty({ example: 'معهد القلم الأهلي' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  instituteName: string;

  @ApiProperty({ example: 'للعام الدراسي' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  beforeYearText: string;

  @ApiProperty({
    example: 'يرجى تزويدنا بالوثيقة لآخر المرحلة الدراسية .',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  closingText: string;
}

export class DocumentRequestSettingsResponseDto {
  @ApiProperty()
  prefix: string;

  @ApiProperty({ description: 'Next number that will be assigned' })
  nextNumber: number;

  @ApiProperty({ description: 'Preview of the next document number' })
  nextDocumentNumber: string;

  @ApiPropertyOptional({
    description: 'Last academic year used when generating a document request',
    example: '2026-2027',
  })
  defaultAcademicYear?: string | null;

  @ApiProperty({ type: DocumentRequestBodyParagraphDto })
  bodyParagraph: DocumentRequestBodyParagraphDto;

  @ApiProperty({
    description: 'Whether a custom uploaded letterhead PDF is configured',
  })
  hasCustomLetterheadTemplate: boolean;

  @ApiPropertyOptional()
  letterheadTemplateFileName?: string | null;

  @ApiPropertyOptional()
  letterheadTemplateUploadedAt?: string | null;
}

export class DocumentRequestCreateDefaultsResponseDto {
  @ApiProperty()
  prefix: string;

  @ApiProperty()
  nextNumber: number;

  @ApiProperty()
  nextDocumentNumber: string;

  @ApiProperty({ example: '2026-2027' })
  academicYear: string;
}

export class CheckDocumentNumberQueryDto {
  @ApiProperty({ example: 'ب5' })
  @IsString()
  @IsNotEmpty()
  documentNumber: string;
}

export class CheckDocumentNumberResponseDto {
  @ApiProperty()
  exists: boolean;
}

export class UpdateDocumentRequestSettingsDto {
  @ApiPropertyOptional({ example: 'ب' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  prefix?: string;

  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  nextNumber?: number;

  @ApiPropertyOptional({ type: DocumentRequestBodyParagraphDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentRequestBodyParagraphDto)
  bodyParagraph?: DocumentRequestBodyParagraphDto;
}

export class CreateDocumentRequestDto {
  @ApiProperty({ description: 'Previous school name (إلى)' })
  @IsString()
  @IsNotEmpty()
  previousSchoolName: string;

  @ApiPropertyOptional({ example: '2026-2027' })
  @IsOptional()
  @IsString()
  @Matches(ACADEMIC_YEAR_PATTERN, {
    message: 'academicYear must be in YYYY-YYYY format',
  })
  academicYear?: string;

  @ApiPropertyOptional({
    description:
      'Full document number (e.g. ب5). Omit to auto-assign the next number.',
    example: 'ب5',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  documentNumber?: string;

  @ApiPropertyOptional({ enum: ['ar', 'ku'], default: 'ar' })
  @IsOptional()
  @IsIn(['ar', 'ku'])
  language?: 'ar' | 'ku';

  @ApiPropertyOptional()
  @ValidateIf((dto: CreateDocumentRequestDto) => !dto.pendingStudentId)
  @IsString()
  @IsNotEmpty()
  studentId?: string;

  @ApiPropertyOptional()
  @ValidateIf((dto: CreateDocumentRequestDto) => !dto.studentId)
  @IsString()
  @IsNotEmpty()
  pendingStudentId?: string;
}

export class DocumentRequestStaffDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;
}

export class DocumentRequestLetterResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  documentNumber: string;

  @ApiProperty()
  documentDate: string;

  @ApiProperty()
  studentFullName: string;

  @ApiProperty()
  previousSchoolName: string;

  @ApiPropertyOptional()
  studentId?: string | null;

  @ApiPropertyOptional()
  pendingStudentId?: string | null;

  @ApiProperty()
  generatedBy: DocumentRequestStaffDto;

  @ApiProperty()
  createdAt: string;
}

export class PaginatedDocumentRequestsResponseDto {
  @ApiProperty({ type: [DocumentRequestLetterResponseDto] })
  data: DocumentRequestLetterResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class ListDocumentRequestsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  studentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  pendingStudentId?: string;
}
