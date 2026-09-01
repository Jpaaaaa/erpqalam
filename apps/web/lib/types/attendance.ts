export type PunchType =
  | 'entry_on_time'
  | 'entry_late'
  | 'exit'
  | 'early_exit'
  | 'out_of_shift';

export type AttendanceHolidayType = 'early_exit' | 'entry_late' | 'day_off';
export type TimeLeaveType = 'late_arrival' | 'early_exit';

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

export interface MergedAttendanceEmployee extends AttendanceUser {
  isUnregistered: boolean;
}

export interface AttendanceSettings {
  shiftStartTime: string;
  shiftEndTime: string;
  entryZoneStart: string;
  entryZoneEnd: string;
  exitZoneStart: string;
  exitZoneEnd: string;
  lateZoneStartTime: string;
  lateZoneEndTime: string;
  earlyLeftZoneStartTime: string;
  earlyLeftZoneEndTime: string;
  workingDays: number[];
  annualHolidaysDays: number;
  tempHolidaysPerFullHoliday: number;
}

export interface AttendanceHoliday {
  id: string;
  date: string;
  type: AttendanceHolidayType;
}

export interface EmployeeHoliday {
  id: string;
  deviceUserId: string;
  date: string;
}

export interface TimeLeaveUsage {
  id: string;
  deviceUserId: string;
  date: string;
  timestamp: string;
  type: TimeLeaveType;
}

export interface LeaveBalance {
  deviceUserId: string;
  balanceDays: number;
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

export interface ApiSuccess {
  success: boolean;
  message?: string;
  added?: number;
}
