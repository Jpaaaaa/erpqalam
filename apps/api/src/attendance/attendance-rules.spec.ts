import {
  AttendanceRecordInput,
  AttendanceUserScheduleInput,
  AttendanceSettingsMap,
  BuildEmployeeReportInput,
  ClassifyPunchContext,
  DEFAULT_ATTENDANCE_SETTINGS,
  buildDailyAttendanceReport,
  buildEmployeeDayRows,
  buildEmployeeReport,
  dateRangeBounds,
  findEarlyExitOccurrences,
  findLateOccurrences,
  enumerateLocalDateKeys,
  isIgnoredDuplicatePunch,
  isRecordInDateRange,
  pickCountableEntryExit,
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

const AFTERNOON_SETTINGS: AttendanceSettingsMap = {
  ...DEFAULT_ATTENDANCE_SETTINGS,
  shift_start_time: '08:00',
  shift_end_time: '14:05',
  entry_zone_start: '07:45',
  entry_zone_end: '08:00',
  late_zone_start_time: '08:00',
  late_zone_end_time: '08:15',
  exit_zone_start: '13:45',
  exit_zone_end: '14:30',
  early_left_zone_start_time: '13:30',
  early_left_zone_end_time: '13:45',
};

describe('punch deduplication (HRAT)', () => {
  const DAY_DEDUP = '2026-09-16';

  function ctx(settings = AFTERNOON_SETTINGS): ClassifyPunchContext {
    return {
      settings,
      usersById: new Map([['101', { deviceUserId: '101' }]]),
      earlyExitDates: new Set(),
      lateEntryDates: new Set(),
    };
  }

  it('first entry wins: 07:55, 07:56, 08:10 → on time, no late', () => {
    const records: AttendanceRecordInput[] = [
      punch('101', DAY_DEDUP, '07:55'),
      punch('101', DAY_DEDUP, '07:56'),
      punch('101', DAY_DEDUP, '08:10'),
      punch('101', DAY_DEDUP, '14:05'),
    ];
    const input = {
      ...baseInput(records, DAY_DEDUP, DAY_DEDUP),
      settings: AFTERNOON_SETTINGS,
    };
    const snap = reportSnapshot(input);
    expect(snap.lateOccurrences).toEqual([]);
    expect(snap.rows.find((r) => r.deviceUserId === '101')?.late_count).toBe(0);

    const dayRows = buildEmployeeDayRows({
      deviceUserId: '101',
      records,
      settings: AFTERNOON_SETTINGS,
      dayOffDates: [],
      employeeHolidayDates: [],
      earlyExitDates: new Set(),
      lateEntryDates: new Set(),
      fromDate: DAY_DEDUP,
      toDate: DAY_DEDUP,
    });
    const row = dayRows.find((r) => r.date === DAY_DEDUP);
    expect(row?.entryType).toBe('entry_on_time');
    expect(row?.entryTime).toContain('07:55');
  });

  it('last exit wins: 14:00, 14:02, 14:05 → exit 14:05', () => {
    const records: AttendanceRecordInput[] = [
      punch('101', DAY_DEDUP, '07:55'),
      punch('101', DAY_DEDUP, '14:00'),
      punch('101', DAY_DEDUP, '14:02'),
      punch('101', DAY_DEDUP, '14:05'),
    ];
    const c = ctx();
    const dayPunches = records;
    const { entry, exit } = pickCountableEntryExit(dayPunches, c);
    expect(entry?.timestamp.getHours()).toBe(7);
    expect(entry?.timestamp.getMinutes()).toBe(55);
    expect(exit?.timestamp.getHours()).toBe(14);
    expect(exit?.timestamp.getMinutes()).toBe(5);

    expect(isIgnoredDuplicatePunch(records[1], dayPunches, c)).toBe(true);
    expect(isIgnoredDuplicatePunch(records[2], dayPunches, c)).toBe(true);

    const daily = buildDailyAttendanceReport({
      date: DAY_DEDUP,
      users: [{ deviceUserId: '101' }],
      records,
      settings: AFTERNOON_SETTINGS,
      orgDayOffDates: new Set(),
      earlyExitHolidayDates: new Set(),
      lateEntryHolidayDates: new Set(),
      employeeHolidayUserIds: new Set(),
      lateUserIds: new Set(),
      earlyExitUserIds: new Set(),
    });
    expect(daily.rows[0]?.exitTime).toContain('14:05');
  });

  it('manual_in still classifies; duplicate late entry does not add late occurrence', () => {
    const manualLate: AttendanceRecordInput = {
      deviceUserId: '101',
      timestamp: ts(DAY_DEDUP, '08:20'),
      verifyType: 'manual_in',
    };
    const records: AttendanceRecordInput[] = [
      punch('101', DAY_DEDUP, '07:55'),
      manualLate,
      punch('101', DAY_DEDUP, '14:05'),
    ];
    const input = {
      ...baseInput(records, DAY_DEDUP, DAY_DEDUP),
      settings: AFTERNOON_SETTINGS,
    };
    expect(findLateOccurrences(input)).toEqual([]);
    expect(isIgnoredDuplicatePunch(manualLate, records, ctx())).toBe(true);
  });
});

describe('enumerateLocalDateKeys', () => {
  it('returns inclusive local dates', () => {
    expect(enumerateLocalDateKeys('2026-01-01', '2026-01-03')).toEqual([
      '2026-01-01',
      '2026-01-02',
      '2026-01-03',
    ]);
    expect(enumerateLocalDateKeys('2026-01-03', '2026-01-01')).toEqual([]);
  });
});
