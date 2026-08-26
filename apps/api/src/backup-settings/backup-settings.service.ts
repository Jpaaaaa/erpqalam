import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  BackupSettingsResponseDto,
  UpsertBackupSettingsDto,
} from './dto/backup-settings.dto';

const REPORT_DEFAULTS = {
  dailyReportEnabled: true,
  dailyReportTime: '20:00',
  weeklyReportEnabled: true,
  weeklyReportDay: 6,
  weeklyReportTime: '20:00',
  monthlyReportEnabled: true,
  monthlyReportDay: 1,
  monthlyReportTime: '20:00',
} as const;

@Injectable()
export class BackupSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<BackupSettingsResponseDto> {
    const existing = await this.prisma.backupSettings.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (!existing) {
      return {
        id: '',
        botToken: '',
        chatIds: [],
        backupTime: '20:00',
        ...REPORT_DEFAULTS,
        updatedAt: new Date(0).toISOString(),
      };
    }

    return this.toResponse(existing);
  }

  async upsert(dto: UpsertBackupSettingsDto): Promise<BackupSettingsResponseDto> {
    const chatIds = [
      ...new Set(
        dto.chatIds
          .map((id) => id.trim())
          .filter((id) => id.length > 0),
      ),
    ];
    const data = {
      botToken: dto.botToken.trim(),
      chatIds,
      backupTime: dto.backupTime.trim().slice(0, 5),
      dailyReportEnabled: dto.dailyReportEnabled,
      dailyReportTime: dto.dailyReportTime.trim().slice(0, 5),
      weeklyReportEnabled: dto.weeklyReportEnabled,
      weeklyReportDay: dto.weeklyReportDay,
      weeklyReportTime: dto.weeklyReportTime.trim().slice(0, 5),
      monthlyReportEnabled: dto.monthlyReportEnabled,
      monthlyReportDay: dto.monthlyReportDay,
      monthlyReportTime: dto.monthlyReportTime.trim().slice(0, 5),
    };

    const existing = await this.prisma.backupSettings.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    const row = existing
      ? await this.prisma.backupSettings.update({
          where: { id: existing.id },
          data,
        })
      : await this.prisma.backupSettings.create({ data });

    return this.toResponse(row);
  }

  private toResponse(row: {
    id: string;
    botToken: string;
    chatIds: string[];
    backupTime: string;
    dailyReportEnabled: boolean;
    dailyReportTime: string;
    weeklyReportEnabled: boolean;
    weeklyReportDay: number;
    weeklyReportTime: string;
    monthlyReportEnabled: boolean;
    monthlyReportDay: number;
    monthlyReportTime: string;
    updatedAt: Date;
  }): BackupSettingsResponseDto {
    return {
      id: row.id,
      botToken: row.botToken,
      chatIds: row.chatIds,
      backupTime: row.backupTime,
      dailyReportEnabled: row.dailyReportEnabled,
      dailyReportTime: row.dailyReportTime,
      weeklyReportEnabled: row.weeklyReportEnabled,
      weeklyReportDay: row.weeklyReportDay,
      weeklyReportTime: row.weeklyReportTime,
      monthlyReportEnabled: row.monthlyReportEnabled,
      monthlyReportDay: row.monthlyReportDay,
      monthlyReportTime: row.monthlyReportTime,
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
