import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ListStudentsQueryDto {
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
  fourthName?: string | null;

  @ApiProperty()
  section: string;

  @ApiProperty({ type: [String] })
  phoneNumbers: string[];

  @ApiProperty({ required: false })
  guardianInfo?: string | null;

  @ApiProperty({ required: false })
  comeViaWho?: string | null;

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
