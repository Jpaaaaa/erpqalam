import { shiftDateKey } from './formatters';
import type { AttendanceHoliday, AttendanceHolidayType, EmployeeHoliday } from '../types/attendance';

export type HolidayRangeGroup = {
  type: AttendanceHolidayType;
  fromDate: string;
  toDate: string;
  ids: string[];
  dayCount: number;
};

function isNextCalendarDay(prev: string, next: string): boolean {
  return shiftDateKey(prev, 1) === next;
}

export function groupOfficialHolidayRanges(
  holidays: AttendanceHoliday[],
): HolidayRangeGroup[] {
  const sorted = [...holidays].sort((a, b) => a.date.localeCompare(b.date));
  const groups: HolidayRangeGroup[] = [];

  for (const row of sorted) {
    const last = groups[groups.length - 1];
    if (
      last &&
      last.type === row.type &&
      isNextCalendarDay(last.toDate, row.date)
    ) {
      last.toDate = row.date;
      last.ids.push(row.id);
      last.dayCount += 1;
    } else {
      groups.push({
        type: row.type,
        fromDate: row.date,
        toDate: row.date,
        ids: [row.id],
        dayCount: 1,
      });
    }
  }
  return groups;
}

export type EmployeeLeaveGroup = {
  deviceUserId: string;
  ranges: { fromDate: string; toDate: string; ids: string[]; dayCount: number }[];
  totalDays: number;
};

export function groupEmployeeLeaveByUser(
  rows: EmployeeHoliday[],
): EmployeeLeaveGroup[] {
  const byUser = new Map<string, EmployeeHoliday[]>();
  for (const row of rows) {
    const list = byUser.get(row.deviceUserId) ?? [];
    list.push(row);
    byUser.set(row.deviceUserId, list);
  }

  const out: EmployeeLeaveGroup[] = [];
  for (const [deviceUserId, list] of byUser) {
    const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
    const ranges: EmployeeLeaveGroup['ranges'] = [];
    for (const row of sorted) {
      const last = ranges[ranges.length - 1];
      if (last && isNextCalendarDay(last.toDate, row.date)) {
        last.toDate = row.date;
        last.ids.push(row.id);
        last.dayCount += 1;
      } else {
        ranges.push({
          fromDate: row.date,
          toDate: row.date,
          ids: [row.id],
          dayCount: 1,
        });
      }
    }
    const totalDays = ranges.reduce((sum, r) => sum + r.dayCount, 0);
    out.push({ deviceUserId, ranges, totalDays });
  }
  return out.sort((a, b) => a.deviceUserId.localeCompare(b.deviceUserId));
}

export function upcomingOfficialRanges(
  groups: HolidayRangeGroup[],
  todayKey: string,
): HolidayRangeGroup[] {
  return groups
    .filter((g) => g.toDate >= todayKey)
    .sort((a, b) => a.fromDate.localeCompare(b.fromDate));
}
