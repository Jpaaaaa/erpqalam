import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

const TIME_PATTERN = /^\d{2}:\d{2}$/;

function toBool({ value }: { value: unknown }) {
  if (value === true || value === 'true' || value === '1') return true;
  if (value === false || value === 'false' || value === '0') return false;
  return value;
}

export class BackupSettingsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: 'Telegram bot token (may be empty)' })
  botToken: string;

  @ApiProperty({ type: [String] })
  chatIds: string[];

  @ApiProperty({ example: '20:00' })
  backupTime: string;

  @ApiProperty()
  dailyReportEnabled: boolean;

  @ApiProperty({ example: '20:00' })
  dailyReportTime: string;

  @ApiProperty()
  weeklyReportEnabled: boolean;

  @ApiProperty({ example: 6, description: '0=Sun … 6=Sat' })
  weeklyReportDay: number;

  @ApiProperty({ example: '20:00' })
  weeklyReportTime: string;

  @ApiProperty()
  monthlyReportEnabled: boolean;

  @ApiProperty({ example: 1 })
  monthlyReportDay: number;

  @ApiProperty({ example: '20:00' })
  monthlyReportTime: string;

  @ApiProperty()
  updatedAt: string;
}

export class UpsertBackupSettingsDto {
  @ApiProperty({ example: '123456:ABC-DEF...' })
  @IsString()
  @MaxLength(200)
  botToken: string;

  @ApiProperty({ type: [String], example: ['123456789', '-100987654321'] })
  @IsArray()
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  chatIds: string[];

  @ApiProperty({ example: '20:00', description: 'DB backup time HH:mm' })
  @IsString()
  @Matches(TIME_PATTERN, { message: 'backupTime must be HH:mm (24-hour)' })
  backupTime: string;

  @ApiProperty({ default: true })
  @Transform(toBool)
  @IsBoolean()
  dailyReportEnabled: boolean;

  @ApiProperty({ example: '20:00' })
  @IsString()
  @Matches(TIME_PATTERN)
  dailyReportTime: string;

  @ApiProperty({ default: true })
  @Transform(toBool)
  @IsBoolean()
  weeklyReportEnabled: boolean;

  @ApiProperty({ example: 6, description: '0=Sun … 6=Sat' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(6)
  weeklyReportDay: number;

  @ApiProperty({ example: '20:00' })
  @IsString()
  @Matches(TIME_PATTERN)
  weeklyReportTime: string;

  @ApiProperty({ default: true })
  @Transform(toBool)
  @IsBoolean()
  monthlyReportEnabled: boolean;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(28)
  monthlyReportDay: number;

  @ApiProperty({ example: '20:00' })
  @IsString()
  @Matches(TIME_PATTERN)
  monthlyReportTime: string;
}

export class RestoreBackupDto {
  @ApiProperty({
    description: 'Must be true to confirm destructive restore',
    example: true,
  })
  @Transform(toBool)
  @IsBoolean()
  confirm: boolean;
}

export class RestoreBackupResponseDto {
  @ApiProperty()
  ok: boolean;

  @ApiPropertyOptional()
  message?: string;
}

export class DetectTelegramChatsDto {
  @ApiPropertyOptional({
    description: 'Bot token to use; falls back to saved settings if omitted',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  botToken?: string;
}

export class DetectedTelegramChatDto {
  @ApiProperty({ example: '123456789' })
  chatId: string;

  @ApiPropertyOptional({ example: 'private' })
  type?: string;

  @ApiPropertyOptional({ example: 'Ali' })
  title?: string;
}

export class DetectTelegramChatsResponseDto {
  @ApiProperty({ type: [DetectedTelegramChatDto] })
  chats: DetectedTelegramChatDto[];
}

export class SendBackupNowResponseDto {
  @ApiProperty()
  ok: boolean;

  @ApiProperty({ description: 'Number of Telegram chats the zip was sent to' })
  sent: number;

  @ApiProperty({ type: [String], description: 'Chat IDs that failed to receive' })
  failed: string[];

  @ApiPropertyOptional()
  message?: string;
}

export class SendReportNowDto {
  @ApiProperty({ enum: ['daily', 'weekly', 'monthly'] })
  @IsIn(['daily', 'weekly', 'monthly'])
  kind: 'daily' | 'weekly' | 'monthly';
}

export class SendReportNowResponseDto {
  @ApiProperty()
  ok: boolean;

  @ApiProperty()
  sent: number;

  @ApiProperty({ type: [String] })
  failed: string[];

  @ApiProperty()
  fileName: string;

  @ApiPropertyOptional()
  message?: string;
}
