import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePendingStudentCheckInDto {
  @ApiProperty({ example: 'Ahmad' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Karim' })
  @IsString()
  @IsNotEmpty()
  secondName: string;

  @ApiProperty({ description: 'School code for intake kiosk', example: 'QALAM001' })
  @IsString()
  @IsNotEmpty()
  schoolCode: string;

  @ApiPropertyOptional({ example: 'Friend referral' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  comeViaWho?: string;
}

export class CreatePendingStudentDto {
  @ApiProperty({ example: 'Ahmad' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Karim' })
  @IsString()
  @IsNotEmpty()
  secondName: string;

  @ApiProperty({ example: 'Hassan' })
  @IsString()
  @IsNotEmpty()
  thirdName: string;

  @ApiProperty({ example: 'Ali' })
  @IsString()
  @IsNotEmpty()
  fourthName: string;

  @ApiProperty({ example: 'Grade 5 / A', description: 'Class or section' })
  @IsString()
  @IsNotEmpty()
  section: string;

  @ApiProperty({
    example: ['07701234567', '07501234567'],
    description: 'Exactly two mobile numbers',
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  phoneNumbers: string[];

  @ApiPropertyOptional({
    example: 'Father: Mohammed, works nearby',
    description: 'Parent/guardian info or notes',
  })
  @IsOptional()
  @IsString()
  guardianInfo?: string;

  @ApiProperty({
    example: 'Referral from Ahmed / Facebook ad',
    description: 'How the student heard about the school or who referred them',
  })
  @IsString()
  @IsNotEmpty()
  comeViaWho: string;
}

export class UpdatePendingStudentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  secondName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  thirdName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fourthName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  section?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  phoneNumbers?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  guardianInfo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  comeViaWho?: string;
}

export class ListPendingStudentsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}

export class StaffMemberDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;
}

export class PendingStudentResponseDto {
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

  @ApiProperty({ required: false })
  section?: string | null;

  @ApiProperty({ type: [String] })
  phoneNumbers: string[];

  @ApiProperty({ required: false })
  guardianInfo?: string | null;

  @ApiProperty({ required: false })
  comeViaWho?: string | null;

  @ApiProperty()
  schoolId: string;

  @ApiProperty({ required: false })
  submittedByUserId?: string | null;

  @ApiProperty({ required: false, type: StaffMemberDto })
  submittedBy?: StaffMemberDto | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedPendingStudentsResponseDto {
  @ApiProperty({ type: [PendingStudentResponseDto] })
  data: PendingStudentResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
