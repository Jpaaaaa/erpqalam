import { Module } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard';
import { BackupService } from './backup.service';
import { BackupReportService } from './backup-report.service';
import { BackupSettingsController } from './backup-settings.controller';
import { BackupSettingsScheduler } from './backup-settings.scheduler';
import { BackupSettingsService } from './backup-settings.service';

@Module({
  controllers: [BackupSettingsController],
  providers: [
    BackupSettingsService,
    BackupService,
    BackupReportService,
    BackupSettingsScheduler,
    RolesGuard,
  ],
})
export class BackupSettingsModule {}
