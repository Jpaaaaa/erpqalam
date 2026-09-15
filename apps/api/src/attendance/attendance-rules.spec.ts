import {
  AttendanceRecordInput,
  AttendanceUserScheduleInput,
  BuildEmployeeReportInput,
  DEFAULT_ATTENDANCE_SETTINGS,
  buildEmployeeReport,
  dateRangeBounds,
  findEarlyExitOccurrences,
  findLateOccurrences,
  isRecordInDateRange,
} from './attendance-rules';

const DAY = '2026-09-15';
const DAY_BEFORE = '2026-09-14';
const DAY_AFTER = '2026-09-16';

function ts(date: string, time: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [h, mi, s = '0'] = time.split(':');
  return new Date(y, m - 1, d, Number(h), Number(mi), Number(s), 0);
}

function punch(
  deviceUserId: string,
  date: string,
  time: string,
): AttendanceRecordInput {
  return {
    deviceUserId,
    timestamp: ts(date, time),
    verifyType: 'finger',
  };
}

const users: AttendanceUserScheduleInput[] = [{ deviceUserId: '101' }];

function baseInput(
  records: AttendanceRecordInput[],
  fromDate: string,
  toDate: string,
): BuildEmployeeReportInput {
  return {
    records,
    settings: DEFAULT_ATTENDANCE_SETTINGS,
    users,
    timeLeaveUsage: [],
    earlyExitDates: [],
    lateEntryDates: [],
    dayOffDates: [],
    employeeHolidays: [],
    fromDate,
    toDate,
  };
}

function sortRows<T extends { deviceUserId: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => a.deviceUserId.localeCompare(b.deviceUserId));
}

function sortLate(
  rows: { deviceUserId: string; date: string }[],
): { deviceUserId: string; date: string }[] {
  return [...rows].sort((a, b) =>
    a.deviceUserId === b.deviceUserId
      ? a.date.localeCompare(b.date)
      : a.deviceUserId.localeCompare(b.deviceUserId),
  );
}

function sortEarly(
  rows: { deviceUserId: string; date: string; timestamp: string }[],
): { deviceUserId: string; date: string; timestamp: string }[] {
  return [...rows].sort((a, b) => {
    const user = a.deviceUserId.localeCompare(b.deviceUserId);
    if (user !== 0) return user;
    const date = a.date.localeCompare(b.date);
    if (date !== 0) return date;
    return a.timestamp.localeCompare(b.timestamp);
  });
}

function reportSnapshot(input: BuildEmployeeReportInput) {
  return {
    rows: sortRows(buildEmployeeReport(input)),
    lateOccurrences: sortLate(findLateOccurrences(input)),
    earlyExitOccurrences: sortEarly(findEarlyExitOccurrences(input)),
  };
}

describe('attendance-rules date window', () => {
  const records: AttendanceRecordInput[] = [
    punch('101', DAY_BEFORE, '07:50'),
    punch('101', DAY_BEFORE, '17:00'),
    punch('101', DAY, '08:05'),
    punch('101', DAY, '16:35'),
    punch('101', DAY_AFTER, '07:50'),
    punch('101', DAY_AFTER, '17:00'),
    punch('999', DAY_BEFORE, '07:50'),
    punch('999', DAY_BEFORE, '17:00'),
  ];

  it('buildEmployeeReport matches when records are pre-filtered to the same day', () => {
    const fromDate = DAY;
    const toDate = DAY;
    const full = reportSnapshot(baseInput(records, fromDate, toDate));
    const filtered = records.filter((r) =>
      isRecordInDateRange(r, fromDate, toDate),
    );
    const prefiltered = reportSnapshot(baseInput(filtered, fromDate, toDate));

    expect(filtered).toHaveLength(2);
    expect(filtered.every((r) => isRecordInDateRange(r, fromDate, toDate))).toBe(
      true,
    );
    expect(prefiltered).toEqual(full);
    expect(full.rows.find((r) => r.deviceUserId === '101')?.late_count).toBe(1);
    expect(full.rows.find((r) => r.deviceUserId === '999')).toBeUndefined();
    expect(full.lateOccurrences).toEqual([{ deviceUserId: '101', date: DAY }]);
    expect(full.earlyExitOccurrences).toHaveLength(1);
    expect(full.earlyExitOccurrences[0]).toMatchObject({
      deviceUserId: '101',
      date: DAY,
    });
  });

  it('dateRangeBounds matches isRecordInDateRange for closed local days', () => {
    const fromDate = DAY;
    const toDate = DAY;
    const { from, to } = dateRangeBounds(fromDate, toDate);
    expect(from).toBeDefined();
    expect(to).toBeDefined();

    const samples: Date[] = [
      ts(DAY, '00:00'),
      ts(DAY, '08:05'),
      ts(DAY, '23:59'),
      new Date(2026, 8, 15, 23, 59, 59, 999),
      ts(DAY_BEFORE, '23:59'),
      ts(DAY_AFTER, '00:00'),
    ];

    for (const timestamp of samples) {
      const record = { deviceUserId: '101', timestamp, verifyType: 'finger' };
      const inJs = isRecordInDateRange(record, fromDate, toDate);
      const inBounds = timestamp >= from! && timestamp <= to!;
      expect({ timestamp: timestamp.toString(), inJs, inBounds }).toEqual({
        timestamp: timestamp.toString(),
        inJs,
        inBounds: inJs,
      });
    }
  });

  it('open fromDate only excludes earlier days', () => {
    const { from, to } = dateRangeBounds(DAY, undefined);
    expect(from).toBeDefined();
    expect(to).toBeUndefined();

    expect(isRecordInDateRange(punch('101', DAY_BEFORE, '12:00'), DAY, '')).toBe(
      false,
    );
    expect(isRecordInDateRange(punch('101', DAY, '00:00'), DAY, '')).toBe(true);
    expect(isRecordInDateRange(punch('101', DAY_AFTER, '00:00'), DAY, '')).toBe(
      true,
    );
    expect(punch('101', DAY_BEFORE, '12:00').timestamp >= from!).toBe(false);
    expect(punch('101', DAY, '00:00').timestamp >= from!).toBe(true);
  });

  it('open toDate only excludes later days', () => {
    const { from, to } = dateRangeBounds(undefined, DAY);
    expect(from).toBeUndefined();
    expect(to).toBeDefined();

    expect(isRecordInDateRange(punch('101', DAY_BEFORE, '12:00'), '', DAY)).toBe(
      true,
    );
    expect(isRecordInDateRange(punch('101', DAY_AFTER, '00:00'), '', DAY)).toBe(
      false,
    );
    expect(punch('101', DAY, '23:59').timestamp <= to!).toBe(true);
    expect(punch('101', DAY_AFTER, '00:00').timestamp <= to!).toBe(false);
  });
});
