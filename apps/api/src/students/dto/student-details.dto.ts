import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { STUDENT_SECTION_KEYS } from '../section-labels';

export class UpdateStudentDetailsDto {
  @ApiPropertyOptional({ example: 'Erbil, Ankawa' })
  @IsOptional()
  @IsString()
  homeAddress?: string;

  @ApiPropertyOptional({ example: 'Erbil' })
  @IsOptional()
  @IsString()
  birthPlace?: string;

  @ApiPropertyOptional({ example: '2005-03-15' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: '123456789012' })
  @IsOptional()
  @IsString()
  nationalIdNumber?: string;

  @ApiPropertyOptional({ example: '987654321' })
  @IsOptional()
  @IsString()
  residenceCardNumber?: string;

  @ApiPropertyOptional({ example: '456789123' })
  @IsOptional()
  @IsString()
  foodRationCardNumber?: string;

  @ApiPropertyOptional({ example: 'Mohammed Hassan' })
  @IsOptional()
  @IsString()
  guardianName?: string;

  @ApiPropertyOptional({ example: '07501234567' })
  @IsOptional()
  @IsString()
  guardianMobile?: string;

  @ApiPropertyOptional({ example: 'First year', description: 'Academic stage / grade level' })
  @IsOptional()
  @IsString()
  stage?: string;

  @ApiPropertyOptional({ example: '07701234567', description: 'Student mobile (syncs to phoneNumbers[0])' })
  @IsOptional()
  @IsString()
  studentMobile?: string;

  @ApiPropertyOptional({ example: 'computer', enum: STUDENT_SECTION_KEYS })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsIn([...STUDENT_SECTION_KEYS])
  section?: string;
}

export class StudentDetailsFieldsDto {
  @ApiPropertyOptional()
  homeAddress?: string | null;

  @ApiPropertyOptional()
  birthPlace?: string | null;

  @ApiPropertyOptional()
  birthDate?: Date | null;

  @ApiPropertyOptional()
  nationalIdNumber?: string | null;

  @ApiPropertyOptional()
  residenceCardNumber?: string | null;

  @ApiPropertyOptional()
  foodRationCardNumber?: string | null;

  @ApiPropertyOptional()
  guardianName?: string | null;

  @ApiPropertyOptional()
  guardianMobile?: string | null;

  @ApiPropertyOptional()
  stage?: string | null;

  @ApiPropertyOptional()
  detailsCompletedAt?: Date | null;
}

export type StudentDetailsRow = {
  homeAddress: string | null;
  birthPlace: string | null;
  birthDate: Date | null;
  nationalIdNumber: string | null;
  residenceCardNumber: string | null;
  foodRationCardNumber: string | null;
  guardianName: string | null;
  guardianMobile: string | null;
  stage: string | null;
  detailsCompletedAt: Date | null;
};

export function toStudentDetailsFields(row: StudentDetailsRow): StudentDetailsFieldsDto {
  return {
    homeAddress: row.homeAddress,
    birthPlace: row.birthPlace,
    birthDate: row.birthDate,
    nationalIdNumber: row.nationalIdNumber,
    residenceCardNumber: row.residenceCardNumber,
    foodRationCardNumber: row.foodRationCardNumber,
    guardianName: row.guardianName,
    guardianMobile: row.guardianMobile,
    stage: row.stage,
    detailsCompletedAt: row.detailsCompletedAt,
  };
}

export function buildDetailsUpdateData(dto: UpdateStudentDetailsDto) {
  const data: Record<string, unknown> = {};

  if (dto.homeAddress !== undefined) {
    data.homeAddress = dto.homeAddress.trim() || null;
  }
  if (dto.birthPlace !== undefined) {
    data.birthPlace = dto.birthPlace.trim() || null;
  }
  if (dto.birthDate !== undefined) {
    data.birthDate = dto.birthDate ? new Date(dto.birthDate) : null;
  }
  if (dto.nationalIdNumber !== undefined) {
    data.nationalIdNumber = dto.nationalIdNumber.trim() || null;
  }
  if (dto.residenceCardNumber !== undefined) {
    data.residenceCardNumber = dto.residenceCardNumber.trim() || null;
  }
  if (dto.foodRationCardNumber !== undefined) {
    data.foodRationCardNumber = dto.foodRationCardNumber.trim() || null;
  }
  if (dto.guardianName !== undefined) {
    data.guardianName = dto.guardianName.trim() || null;
  }
  if (dto.guardianMobile !== undefined) {
    data.guardianMobile = dto.guardianMobile.trim() || null;
  }
  if (dto.stage !== undefined) {
    data.stage = dto.stage.trim() || null;
  }
  if (dto.section !== undefined) {
    data.section = dto.section.trim();
  }

  data.detailsCompletedAt = new Date();

  return data;
}
