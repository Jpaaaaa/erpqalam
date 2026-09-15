export type PunchType =
  | 'entry_on_time'
  | 'entry_late'
  | 'exit'
  | 'early_exit'
  | 'out_of_shift';

export interface AttendanceRecord {
  id: string;
  deviceUserId: string;
  timestamp: string;
  verifyType: string;
  deviceSerial: string;
  createdAt: string;
  punchType?: PunchType | null;
}

export interface AttendanceDevice {
  id: string;
  serialNumber: string;
  name: string;
  lastSeenAt?: string | null;
  isActive: boolean;
}

export interface AttendanceUser {
  id: string;
  deviceUserId: string;
  name: string;
  workingDays?: string | null;
  shiftStartTime?: string | null;
  shiftEndTime?: string | null;
  entryZoneStart?: string | null;
  entryZoneEnd?: string | null;
  exitZoneStart?: string | null;
  exitZoneEnd?: string | null;
  lateZoneStartTime?: string | null;
  lateZoneEndTime?: string | null;
  earlyLeftZoneStartTime?: string | null;
  earlyLeftZoneEndTime?: string | null;
  linkedUserId?: string | null;
}

export interface EmployeeReportRow {
  deviceUserId: string;
  workingDaysPresent: number;
  lateCount: number;
  expectedWorkingDays: number;
  daysAbsent: number;
}

export interface EmployeeReport {
  rows: EmployeeReportRow[];
  lateOccurrences: { deviceUserId: string; date: string }[];
  earlyExitOccurrences: {
    deviceUserId: string;
    date: string;
    timestamp: string;
  }[];
}

export interface DateFilter {
  fromDate: string;
  toDate: string;
}

export type QuickRangeKey = 'today' | 'yesterday' | 'week' | 'month';
