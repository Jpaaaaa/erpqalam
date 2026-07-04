import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DocumentRequestSettingsResponseDto {
  @ApiProperty()
  prefix: string;

  @ApiProperty({ description: 'Next number that will be assigned' })
  nextNumber: number;

  @ApiProperty({ description: 'Preview of the next document number' })
  nextDocumentNumber: string;
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
}

export class CreateDocumentRequestDto {
  @ApiProperty({ description: 'Previous school name (إلى)' })
  @IsString()
  @IsNotEmpty()
  previousSchoolName: string;

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
