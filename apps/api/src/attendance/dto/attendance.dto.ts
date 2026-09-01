import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class ListAttendanceRecordsQueryDto {
  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsString()
  @Matches(DATE_PATTERN)
  fromDate?: string;

  @ApiPropertyOptional({ example: '2026-01-31' })
  @IsOptional()
  @IsString()
  @Matches(DATE_PATTERN)
  toDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deviceUserId?: string;

  @ApiPropertyOptional({ default: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 500;
}

export class AttendanceRecordResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  deviceUserId!: string;

  @ApiProperty()
  timestamp!: string;

  @ApiProperty()
  verifyType!: string;

  @ApiProperty()
  deviceSerial!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional()
  punchType?: string | null;
}

export class ManualPunchDto {
  @ApiProperty()
  @IsString()
  deviceUserId!: string;

  @ApiProperty({ example: '2026-01-15T08:05:00.000' })
  @IsString()
  timestamp!: string;

  @ApiPropertyOptional({ enum: ['in', 'out'], default: 'in' })
  @IsOptional()
  @IsEnum(['in', 'out'])
  punchKind?: 'in' | 'out' = 'in';
}

export class AttendanceUserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  deviceUserId!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  workingDays?: string | null;

  @ApiPropertyOptional()
  shiftStartTime?: string | null;

  @ApiPropertyOptional()
  shiftEndTime?: string | null;

  @ApiPropertyOptional()
  entryZoneStart?: string | null;

  @ApiPropertyOptional()
  entryZoneEnd?: string | null;

  @ApiPropertyOptional()
  exitZoneStart?: string | null;

  @ApiPropertyOptional()
  exitZoneEnd?: string | null;

  @ApiPropertyOptional()
  lateZoneStartTime?: string | null;

  @ApiPropertyOptional()
  lateZoneEndTime?: string | null;

  @ApiPropertyOptional()
  earlyLeftZoneStartTime?: string | null;

  @ApiPropertyOptional()
  earlyLeftZoneEndTime?: string | null;

  @ApiPropertyOptional()
  linkedUserId?: string | null;
}

export class CreateAttendanceUserDto {
  @ApiProperty()
  @IsString()
  deviceUserId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}

export class UpdateAttendanceUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'JSON array string e.g. [0,1,2,3,4,5]' })
  @IsOptional()
  @IsString()
  workingDays?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shiftStartTime?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shiftEndTime?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entryZoneStart?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entryZoneEnd?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  exitZoneStart?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  exitZoneEnd?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lateZoneStartTime?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lateZoneEndTime?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  earlyLeftZoneStartTime?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  earlyLeftZoneEndTime?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkedUserId?: string | null;
}

export class AttendanceSettingsResponseDto {
  @ApiProperty()
  shiftStartTime!: string;

  @ApiProperty()
  shiftEndTime!: string;

  @ApiProperty()
  entryZoneStart!: string;

  @ApiProperty()
  entryZoneEnd!: string;

  @ApiProperty()
  exitZoneStart!: string;

  @ApiProperty()
  exitZoneEnd!: string;

  @ApiProperty()
  lateZoneStartTime!: string;

  @ApiProperty()
  lateZoneEndTime!: string;

  @ApiProperty()
  earlyLeftZoneStartTime!: string;

  @ApiProperty()
  earlyLeftZoneEndTime!: string;

  @ApiProperty({ type: [Number] })
  workingDays!: number[];

  @ApiProperty()
  annualHolidaysDays!: number;

  @ApiProperty()
  tempHolidaysPerFullHoliday!: number;
}

export class UpdateAttendanceSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shiftStartTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shiftEndTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entryZoneStart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  entryZoneEnd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  exitZoneStart?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  exitZoneEnd?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lateZoneStartTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lateZoneEndTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  earlyLeftZoneStartTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  earlyLeftZoneEndTime?: string;

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  workingDays?: number[];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  annualHolidaysDays?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tempHolidaysPerFullHoliday?: number;
}

export class AttendanceHolidayResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  date!: string;

  @ApiProperty({ enum: ['early_exit', 'entry_late', 'day_off'] })
  type!: string;
}

export class CreateAttendanceHolidayDto {
  @ApiProperty()
  @IsString()
  @Matches(DATE_PATTERN)
  date!: string;

  @ApiProperty({ enum: ['early_exit', 'entry_late', 'day_off'] })
  @IsEnum(['early_exit', 'entry_late', 'day_off'])
  type!: 'early_exit' | 'entry_late' | 'day_off';
}

export class CreateAttendanceHolidayRangeDto {
  @ApiProperty()
  @IsString()
  @Matches(DATE_PATTERN)
  dateFrom!: string;

  @ApiProperty()
  @IsString()
  @Matches(DATE_PATTERN)
  dateTo!: string;

  @ApiProperty({ enum: ['early_exit', 'entry_late', 'day_off'] })
  @IsEnum(['early_exit', 'entry_late', 'day_off'])
  type!: 'early_exit' | 'entry_late' | 'day_off';
}

export class DeleteAttendanceHolidaysDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  ids!: string[];
}

export class EmployeeHolidayResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  deviceUserId!: string;

  @ApiProperty()
  date!: string;
}

export class CreateEmployeeHolidayDto {
  @ApiProperty()
  @IsString()
  deviceUserId!: string;

  @ApiProperty()
  @IsString()
  @Matches(DATE_PATTERN)
  date!: string;
}

export class CreateEmployeeHolidayRangeDto {
  @ApiProperty()
  @IsString()
  deviceUserId!: string;

  @ApiProperty()
  @IsString()
  @Matches(DATE_PATTERN)
  dateFrom!: string;

  @ApiProperty()
  @IsString()
  @Matches(DATE_PATTERN)
  dateTo!: string;
}

export class DeleteEmployeeHolidaysDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  ids!: string[];
}

export class TimeLeaveUsageResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  deviceUserId!: string;

  @ApiProperty()
  date!: string;

  @ApiProperty()
  timestamp!: string;

  @ApiProperty({ enum: ['late_arrival', 'early_exit'] })
  type!: string;
}

export class CreateTimeLeaveUsageDto {
  @ApiProperty()
  @IsString()
  deviceUserId!: string;

  @ApiProperty()
  @IsString()
  @Matches(DATE_PATTERN)
  date!: string;

  @ApiProperty()
  @IsString()
  timestamp!: string;

  @ApiProperty({ enum: ['late_arrival', 'early_exit'] })
  @IsEnum(['late_arrival', 'early_exit'])
  type!: 'late_arrival' | 'early_exit';
}

export class LeaveBalanceResponseDto {
  @ApiProperty()
  deviceUserId!: string;

  @ApiProperty()
  balanceDays!: number;
}

export class SetLeaveBalanceDto {
  @ApiProperty()
  @IsNumber()
  balanceDays!: number;
}

export class EmployeeReportQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(DATE_PATTERN)
  fromDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(DATE_PATTERN)
  toDate?: string;
}

export class EmployeeReportRowDto {
  @ApiProperty()
  deviceUserId!: string;

  @ApiProperty()
  workingDaysPresent!: number;

  @ApiProperty()
  lateCount!: number;

  @ApiProperty()
  expectedWorkingDays!: number;

  @ApiProperty()
  daysAbsent!: number;
}

export class EmployeeReportResponseDto {
  @ApiProperty({ type: [EmployeeReportRowDto] })
  rows!: EmployeeReportRowDto[];

  @ApiProperty({ type: [Object] })
  lateOccurrences!: { deviceUserId: string; date: string }[];

  @ApiProperty({ type: [Object] })
  earlyExitOccurrences!: {
    deviceUserId: string;
    date: string;
    timestamp: string;
  }[];
}

export class SuccessResponseDto {
  @ApiProperty()
  success!: boolean;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional()
  added?: number;
}
