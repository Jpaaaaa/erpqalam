import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../database/prisma.service';
import { BackupService } from './backup.service';
import { BackupReportService, type ReportKind } from './backup-report.service';

@Injectable()
export class BackupSettingsScheduler {
  private readonly logger = new Logger(BackupSettingsScheduler.name);
  private readonly lastRunKeys = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly backupService: BackupService,
    private readonly reportService: BackupReportService,
  ) {}

  private currentHm(now: Date): string {
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  private markOnce(key: string): boolean {
    if (this.lastRunKeys.has(key)) return false;
    this.lastRunKeys.add(key);
    // Keep set from growing forever
    if (this.lastRunKeys.size > 64) {
      const first = this.lastRunKeys.values().next().value;
      if (first) this.lastRunKeys.delete(first);
    }
    return true;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledJobs(): Promise<void> {
    const settings = await this.prisma.backupSettings.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (!settings?.botToken?.trim() || settings.chatIds.length === 0) {
      return;
    }

    const now = new Date();
    const hm = this.currentHm(now);
    const dayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

    if (hm === settings.backupTime) {
      const key = `backup-${dayKey}-${settings.backupTime}`;
      if (this.markOnce(key)) {
        await this.runBackup(settings.botToken, settings.chatIds);
      }
    }

    if (settings.dailyReportEnabled && hm === settings.dailyReportTime) {
      const key = `daily-${dayKey}-${settings.dailyReportTime}`;
      if (this.markOnce(key)) {
        await this.runReport('daily', settings.botToken, settings.chatIds, now);
      }
    }

    if (
      settings.weeklyReportEnabled &&
      now.getDay() === settings.weeklyReportDay &&
      hm === settings.weeklyReportTime
    ) {
      const key = `weekly-${dayKey}-${settings.weeklyReportTime}`;
      if (this.markOnce(key)) {
        await this.runReport('weekly', settings.botToken, settings.chatIds, now);
      }
    }

    if (
      settings.monthlyReportEnabled &&
      now.getDate() === settings.monthlyReportDay &&
      hm === settings.monthlyReportTime
    ) {
      const key = `monthly-${now.getFullYear()}-${now.getMonth() + 1}-${settings.monthlyReportDay}-${settings.monthlyReportTime}`;
      if (this.markOnce(key)) {
        await this.runReport('monthly', settings.botToken, settings.chatIds, now);
      }
    }
  }

  private async runBackup(botToken: string, chatIds: string[]): Promise<void> {
    this.logger.log('Starting scheduled backup');
    let zipPath: string | undefined;
    try {
      const backup = await this.backupService.createBackup();
      zipPath = backup.zipPath;
      for (const chatId of chatIds) {
        try {
          await this.backupService.sendTelegramDocument(
            botToken,
            chatId,
            backup.zipPath,
            backup.fileName,
            {
              contentType: 'application/zip',
              caption: `ERP Qalam backup ${new Date().toISOString()}`,
            },
          );
        } catch (err) {
          this.logger.error(
            `Failed to send backup to chat ${chatId}: ${
              err instanceof Error ? err.message : String(err)
            }`,
          );
        }
      }
    } catch (err) {
      this.logger.error(
        `Scheduled backup failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    } finally {
      if (zipPath) {
        await this.backupService.cleanupBackupArtifact(zipPath);
      }
    }
  }

  private async runReport(
    kind: ReportKind,
    botToken: string,
    chatIds: string[],
    now: Date,
  ): Promise<void> {
    this.logger.log(`Starting scheduled ${kind} report`);
    try {
      const result = await this.reportService.sendReport(
        kind,
        botToken,
        chatIds,
        now,
        'scheduled',
      );
      this.logger.log(
        `${kind} report sent=${result.sent} failed=${result.failed.length} file=${result.fileName}`,
      );
    } catch (err) {
      this.logger.error(
        `Scheduled ${kind} report failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }
}
