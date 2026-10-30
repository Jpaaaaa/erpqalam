import type { DailyAttendanceRow, DailyAttendanceSummary } from '../types/attendance';
import { isNonWorkingSchoolDay } from './dailyWeek';
import { todayDateKey } from './formatters';

export type TodayAbsentEmployee = {
  deviceUserId: string;
  name: string;
};

const NOT_PUNCHED_EXCLUDED_STATUSES = new Set<DailyAttendanceRow['status']>([
  'on_leave',
  'official_holiday',
  'day_off',
]);

/** Registered employees with no counted entry punch today (works before shift start). */
export function isNotPunchedTodayRow(row: DailyAttendanceRow): boolean {
  if (NOT_PUNCHED_EXCLUDED_STATUSES.has(row.status)) {
    return false;
  }
  const entry = row.entryTime?.trim();
  return !entry;
}

export function listTodayAbsentEmployees(
  rows: DailyAttendanceRow[],
  nameLookup: Map<string, string>,
): TodayAbsentEmployee[] {
  return rows.filter(isNotPunchedTodayRow).map((row) => ({
    deviceUserId: row.deviceUserId,
    name: nameLookup.get(row.deviceUserId) || row.deviceUserId,
  }));
}

export function isTodayOffDay(
  summary: DailyAttendanceSummary | null,
  dateKey: string = todayDateKey(),
): boolean {
  return isNonWorkingSchoolDay(dateKey, summary);
}
