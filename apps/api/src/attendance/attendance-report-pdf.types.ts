import type {
  AttendanceSettingsMap,
  DailyAttendanceRow,
  DailyAttendanceSummary,
  EmployeeDayRow,
} from './attendance-rules';
import type { EmployeeReportPdfType } from './dto/attendance.dto';

export type EmployeeReportPdfRow = {
  deviceUserId: string;
  name: string;
  workingDaysPresent: number;
  expectedWorkingDays: number;
  daysAbsent: number;
  lateCount: number;
  leaveBalance: number;
};

export type EmployeeReportPdfPayload = {
  type: EmployeeReportPdfType;
  fromDate: string;
  toDate: string;
  generatedAt: string;
  rows: EmployeeReportPdfRow[];
  totals: {
    empCount: number;
    totalPresent: number;
    totalExpected: number;
    totalAbsent: number;
    totalLate: number;
    avgRate: number;
  };
  selectedEmployee?: {
    deviceUserId: string;
    name: string;
    present: number;
    expected: number;
    absent: number;
    leaveBalance: number;
    notComing: number;
    days: EmployeeDayRow[];
  };
  daily?: {
    date: string;
    rows: (DailyAttendanceRow & { name: string })[];
    summary: DailyAttendanceSummary;
  };
  settings?: AttendanceSettingsMap;
};
