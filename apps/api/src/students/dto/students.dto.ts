import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { STUDENT_SECTION_KEYS } from '../section-labels';

export class ListStudentsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search by student or guardian name' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by section key (e.g. computer)' })
  @IsOptional()
  @IsString()
  section?: string;

  @ApiPropertyOptional({ enum: ['complete', 'incomplete'] })
  @IsOptional()
  @IsIn(['complete', 'incomplete'])
  detailsStatus?: 'complete' | 'incomplete';

  @ApiPropertyOptional({ description: 'Filter by referral source key' })
  @IsOptional()
  @IsString()
  cameVia?: string;

  @ApiPropertyOptional({ description: 'Filter by phone number (partial match)' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Filter by academic stage (partial match)' })
  @IsOptional()
  @IsString()
  stage?: string;
}

export class StudentRegistrarDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;
}

export class StudentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  secondName: string;

  @ApiProperty({ required: false })
  thirdName?: string | null;

  @ApiProperty({ required: false })
  fourthName?: string | null;

  @ApiProperty()
  section: string;

  @ApiProperty({ type: [String] })
  phoneNumbers: string[];

  @ApiProperty({ required: false })
  guardianInfo?: string | null;

  @ApiProperty({ required: false })
  comeViaWho?: string | null;

  @ApiProperty({ required: false })
  homeAddress?: string | null;

  @ApiProperty({ required: false })
  birthPlace?: string | null;

  @ApiProperty({ required: false })
  birthDate?: Date | null;

  @ApiProperty({ required: false })
  nationalIdNumber?: string | null;

  @ApiProperty({ required: false })
  residenceCardNumber?: string | null;

  @ApiProperty({ required: false })
  foodRationCardNumber?: string | null;

  @ApiProperty({ required: false })
  guardianName?: string | null;

  @ApiProperty({ required: false })
  guardianMobile?: string | null;

  @ApiProperty({ required: false })
  stage?: string | null;

  @ApiProperty({ required: false })
  detailsCompletedAt?: Date | null;

  @ApiProperty()
  schoolId: string;

  @ApiProperty({ required: false })
  registeredByUserId?: string | null;

  @ApiProperty({ required: false, type: StudentRegistrarDto })
  registeredBy?: StudentRegistrarDto | null;

  @ApiProperty({ required: false })
  registeredAt?: Date | null;

  @ApiProperty({ required: false })
  pendingStudentId?: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class UpdateStudentDto {
  @ApiPropertyOptional({ example: 'Ahmad' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Karim' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  secondName?: string;

  @ApiPropertyOptional({ example: 'Hassan' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  thirdName?: string;

  @ApiPropertyOptional({ example: 'Ali' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fourthName?: string;

  @ApiPropertyOptional({ example: 'computer', enum: STUDENT_SECTION_KEYS })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsIn([...STUDENT_SECTION_KEYS])
  section?: string;
}

export class PaginatedStudentsResponseDto {
  @ApiProperty({ type: [StudentResponseDto] })
  data: StudentResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
