import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { StudentStatus } from '@generated/prisma/client';

export class CreateStudentPendingDto {
  @ApiProperty({ example: 'Ahmad' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Karim' })
  @IsString()
  @IsNotEmpty()
  secondName: string;

  @ApiProperty({
    description: 'School code for intake kiosk',
    example: 'QALAM001',
  })
  @IsString()
  @IsNotEmpty()
  schoolCode: string;
}

export class CreateStudentPendingFullDto {
  @ApiProperty({ example: 'Ahmad' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Karim' })
  @IsString()
  @IsNotEmpty()
  secondName: string;

  @ApiPropertyOptional({ example: 'Hassan' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  thirdName?: string;

  @ApiProperty({ example: '+9647700000001' })
  @IsString()
  @IsNotEmpty()
  mobilePrimary: string;

  @ApiPropertyOptional({ example: '+9647700000002' })
  @IsOptional()
  @IsString()
  mobileSecondary?: string;

  @ApiProperty({ example: 'Friend referral' })
  @IsString()
  @IsNotEmpty()
  comeViaWho: string;
}

export class ListStudentsQueryDto {
  @ApiPropertyOptional({ enum: StudentStatus })
  @IsOptional()
  @IsEnum(StudentStatus)
  status?: StudentStatus;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
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
  mobilePrimary?: string | null;

  @ApiProperty({ required: false })
  mobileSecondary?: string | null;

  @ApiProperty({ required: false })
  comeViaWho?: string | null;

  @ApiProperty({ enum: StudentStatus })
  status: StudentStatus;

  @ApiProperty()
  schoolId: string;

  @ApiProperty({ required: false })
  registeredByUserId?: string | null;

  @ApiProperty({ required: false, type: StudentRegistrarDto })
  registeredBy?: StudentRegistrarDto | null;

  @ApiProperty({ required: false })
  registeredAt?: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
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
