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
  /** Leave days in the selected period (employee holiday rows). */
  leaveDaysInPeriod?: number;
};

export type EmployeeReportPdfEmployeeDetail = {
  deviceUserId: string;
  name: string;
  present: number;
  expected: number;
  absent: number;
  leaveBalance: number;
  leaveDaysInPeriod: number;
  notComing: number;
  days: EmployeeDayRow[];
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
  selectedEmployee?: EmployeeReportPdfEmployeeDetail;
  allEmployees?: EmployeeReportPdfEmployeeDetail[];
  daily?: {
    date: string;
    rows: (DailyAttendanceRow & { name: string })[];
    summary: DailyAttendanceSummary;
  };
  settings?: AttendanceSettingsMap;
};
