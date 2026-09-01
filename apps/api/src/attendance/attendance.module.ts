import { Module } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceReportPdfService } from './attendance-report-pdf.service';
import { AttendanceService } from './attendance.service';
import { IclockController } from './iclock/iclock.controller';
import { IclockService } from './iclock/iclock.service';

@Module({
  controllers: [AttendanceController, IclockController],
  providers: [AttendanceService, AttendanceReportPdfService, IclockService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
