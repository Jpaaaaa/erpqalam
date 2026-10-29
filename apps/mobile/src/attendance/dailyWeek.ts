import type { DailyAttendanceSummary } from '../types/attendance';
import { formatLocalDateKey, shiftDateKey } from './formatters';

/** Monday = start of week (local calendar). */
export function weekStartMonday(dateKey: string): string {
  const parts = dateKey.split('-').map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return dateKey;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return formatLocalDateKey(d);
}

export function weekDayKeys(weekStart: string): string[] {
  const keys: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    keys.push(shiftDateKey(weekStart, i));
  }
  return keys;
}

export function shiftWeek(dateKey: string, deltaWeeks: number): string {
  return shiftDateKey(dateKey, deltaWeeks * 7);
}

/** Friday = 5, Saturday = 6 in JS getDay(). */
export function isWeekendOffDay(dateKey: string): boolean {
  const parts = dateKey.split('-').map((p) => parseInt(p, 10));
  if (parts.length !== 3) return false;
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  const day = d.getDay();
  return day === 5 || day === 6;
}

export function isNonWorkingSchoolDay(
  dateKey: string,
  summary: DailyAttendanceSummary | null,
): boolean {
  if (isWeekendOffDay(dateKey)) return true;
  if (!summary || summary.employeeCount === 0) return false;
  const active =
    summary.present +
    summary.late +
    summary.earlyExit +
    summary.absent +
    summary.onLeave;
  if (active === 0 && (summary.dayOff > 0 || summary.officialHoliday > 0)) {
    return true;
  }
  return false;
}

export function parseDateKeyMonthIndex(dateKey: string): { y: number; m: number } | null {
  const parts = dateKey.split('-').map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  return { y: parts[0], m: parts[1] - 1 };
}
