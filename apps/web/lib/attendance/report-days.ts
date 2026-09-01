import type {
  AttendanceHoliday,
  AttendanceRecord,
  AttendanceSettings,
  AttendanceUser,
  EmployeeHoliday,
  PunchType,
} from '@/lib/types/attendance';
import { formatLocalDateKey } from '@/lib/attendance/formatters';

export interface EmployeeDayRow {
  date: string;
  entryTime: string | null;
  exitTime: string | null;
  entryType: PunchType | null;
  exitType: PunchType | null;
  isHoliday?: boolean;
  isNotComing?: boolean;
}

export function parseWorkingDays(raw?: string | null): number[] | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'number')) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

export function getExpectedWorkingDates(
  fromDate: string,
  toDate: string,
  workingDays: number[],
  dayOffDates: { date: string }[],
): string[] {
  const dayOffSet = new Set(dayOffDates.map((h) => h.date));
  const result: string[] = [];
  const from = parseLocalDate(fromDate);
  const to = parseLocalDate(toDate);
  if (!from || !to || from > to) return result;

  const cur = new Date(from.getTime());
  while (cur <= to) {
    const dateKey = formatLocalDateKey(cur);
    if (workingDays.includes(cur.getDay()) && !dayOffSet.has(dateKey)) {
      result.push(dateKey);
    }
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

function parseLocalDate(value: string): Date | null {
  const parts = value.split('-').map((part) => parseInt(part, 10));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function recordDateKey(timestamp: string): string {
  return timestamp.slice(0, 10);
}

export function buildEmployeeDayRows(input: {
  deviceUserId: string;
  records: AttendanceRecord[];
  user?: AttendanceUser;
  settings: AttendanceSettings;
  holidays: AttendanceHoliday[];
  employeeHolidays: EmployeeHoliday[];
  fromDate: string;
  toDate: string;
}): EmployeeDayRow[] {
  const {
    deviceUserId,
    records,
    user,
    settings,
    holidays,
    employeeHolidays,
  } = input;

  let fromDate = input.fromDate;
  let toDate = input.toDate;
  if (!fromDate || !toDate) {
    const keys = records
      .filter((record) => record.deviceUserId === deviceUserId)
      .map((record) => record.timestamp.slice(0, 10));
    if (keys.length > 0) {
      fromDate = fromDate || keys.reduce((a, b) => (a < b ? a : b));
      toDate = toDate || keys.reduce((a, b) => (a > b ? a : b));
    }
  }

  const workingDays =
    parseWorkingDays(user?.workingDays) ?? settings.workingDays ?? [0, 1, 2, 3, 4, 5];
  const dayOffDates = holidays
    .filter((holiday) => holiday.type === 'day_off')
    .map((holiday) => ({ date: holiday.date }));
  const expected = getExpectedWorkingDates(fromDate, toDate, workingDays, dayOffDates);
  const holidaySet = new Set(
    employeeHolidays
      .filter((holiday) => holiday.deviceUserId === deviceUserId)
      .map((holiday) => holiday.date),
  );

  const byDate = new Map<string, AttendanceRecord[]>();
  for (const record of records) {
    if (record.deviceUserId !== deviceUserId) continue;
    const dateKey = recordDateKey(record.timestamp);
    if (fromDate && dateKey < fromDate) continue;
    if (toDate && dateKey > toDate) continue;
    const list = byDate.get(dateKey) ?? [];
    list.push(record);
    byDate.set(dateKey, list);
  }

  return expected.map((dateKey) => {
    if (holidaySet.has(dateKey)) {
      return {
        date: dateKey,
        entryTime: null,
        exitTime: null,
        entryType: null,
        exitType: null,
        isHoliday: true,
      };
    }

    const punches = [...(byDate.get(dateKey) ?? [])].sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp),
    );
    const allOutOfShift =
      punches.length > 0 &&
      punches.every(
        (punch) => punch.punchType === 'out_of_shift' || !punch.punchType,
      );

    if (punches.length === 0 || allOutOfShift) {
      return {
        date: dateKey,
        entryTime: null,
        exitTime: null,
        entryType: null,
        exitType: null,
        isNotComing: true,
      };
    }

    const entryPunches = punches.filter(
      (punch) =>
        punch.punchType === 'entry_on_time' || punch.punchType === 'entry_late',
    );
    const exitPunches = punches.filter(
      (punch) => punch.punchType === 'exit' || punch.punchType === 'early_exit',
    );
    const entry = entryPunches[0] ?? null;
    const exit = exitPunches.length > 0 ? exitPunches[exitPunches.length - 1] : null;

    return {
      date: dateKey,
      entryTime: entry?.timestamp ?? null,
      exitTime: exit?.timestamp ?? null,
      entryType: (entry?.punchType as PunchType | null) ?? null,
      exitType: (exit?.punchType as PunchType | null) ?? null,
    };
  });
}
