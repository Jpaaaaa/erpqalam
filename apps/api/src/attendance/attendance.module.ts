import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendancePdfChromiumService } from './attendance-pdf-chromium.service';
import { AttendanceReportPdfFallbackService } from './attendance-report-pdf-fallback.service';
import { AttendanceReportPdfService } from './attendance-report-pdf.service';
import { AttendanceService } from './attendance.service';
import { IclockController } from './iclock/iclock.controller';
import { IclockService } from './iclock/iclock.service';
import { SchoolLogoStorage } from './school-logo.storage';

@Module({
  controllers: [AttendanceController, IclockController],
  providers: [
    AttendanceService,
    AttendanceReportPdfService,
    AttendanceReportPdfFallbackService,
    AttendancePdfChromiumService,
    SchoolLogoStorage,
    IclockService,
  ],
  exports: [AttendanceService],
})
export class AttendanceModule {}
