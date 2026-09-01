/**
 * Pure attendance rules ported from HRAT (no Nest/Prisma imports).
 * Timestamps are local wall-clock; date/time extraction never uses toISOString().
 */

export type PunchType =
  | 'entry_on_time'
  | 'entry_late'
  | 'exit'
  | 'early_exit'
  | 'out_of_shift';

export type AttendanceTimeSettingKey =
  | 'shift_start_time'
  | 'shift_end_time'
  | 'entry_zone_start'
  | 'entry_zone_end'
  | 'exit_zone_start'
  | 'exit_zone_end'
  | 'late_zone_start_time'
  | 'late_zone_end_time'
  | 'early_left_zone_start_time'
  | 'early_left_zone_end_time';

export interface AttendanceSettingsMap {
  shift_start_time: string;
  shift_end_time: string;
  entry_zone_start: string;
  entry_zone_end: string;
  exit_zone_start: string;
  exit_zone_end: string;
  late_zone_start_time: string;
  late_zone_end_time: string;
  early_left_zone_start_time: string;
  early_left_zone_end_time: string;
  working_days: number[];
  annual_holidays_days: number;
  temp_holidays_per_full_holiday: number;
}

export interface AttendanceUserScheduleInput {
  deviceUserId: string;
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
}

export interface EffectiveSchedule {
  working_days: number[];
  shift_start_time: string;
  shift_end_time: string;
  entry_zone_start: string;
  entry_zone_end: string;
  exit_zone_start: string;
  exit_zone_end: string;
  late_zone_start_time: string;
  late_zone_end_time: string;
  early_left_zone_start_time: string;
  early_left_zone_end_time: string;
}

export interface AttendanceRecordInput {
  deviceUserId: string;
  timestamp: Date;
  verifyType: string;
}

export interface HolidayDateInput {
  date: string;
  type: string;
}

export interface TimeLeaveUsageInput {
  deviceUserId: string;
  date: string;
  timestamp: string;
  type: string;
}

export interface EmployeeHolidayInput {
  deviceUserId: string;
  date: string;
}

export interface EmployeeReportRow {
  deviceUserId: string;
  working_days_present: number;
  late_count: number;
  expected_working_days: number;
  days_absent: number;
}

export interface LateOccurrence {
  deviceUserId: string;
  date: string;
}

export interface EarlyExitOccurrence {
  deviceUserId: string;
  date: string;
  timestamp: string;
}

export const DEFAULT_ATTENDANCE_SETTINGS: AttendanceSettingsMap = {
  shift_start_time: '08:00',
  shift_end_time: '17:00',
  entry_zone_start: '07:45',
  entry_zone_end: '08:00',
  exit_zone_start: '16:45',
  exit_zone_end: '17:30',
  late_zone_start_time: '08:00',
  late_zone_end_time: '08:15',
  early_left_zone_start_time: '16:30',
  early_left_zone_end_time: '16:45',
  working_days: [0, 1, 2, 3, 4, 5],
  annual_holidays_days: 7,
  temp_holidays_per_full_holiday: 3,
};

export const ATTENDANCE_SETTING_KEYS = [
  'shift_start_time',
  'shift_end_time',
  'entry_zone_start',
  'entry_zone_end',
  'exit_zone_start',
  'exit_zone_end',
  'late_zone_start_time',
  'late_zone_end_time',
  'early_left_zone_start_time',
  'early_left_zone_end_time',
  'working_days',
  'annual_holidays_days',
  'temp_holidays_per_full_holiday',
] as const;

export function getSettingTime(
  settings: AttendanceSettingsMap,
  key: AttendanceTimeSettingKey,
): string {
  const value = settings[key];
  return value !== undefined && value !== null && String(value).trim() !== ''
    ? String(value).trim()
    : DEFAULT_ATTENDANCE_SETTINGS[key];
}

export function parseDateLocal(dateStr: string): Date | null {
  const parts = String(dateStr).trim().split('-');
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null;
  const date = new Date(y, m, d);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function formatDateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getDateKeyFromTimestamp(d: Date): string {
  return formatDateLocal(d);
}

export function getTimeMinutesFromTimestamp(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}

export function getTimestampMillis(d: Date): number {
  return d.getTime();
}

function parseWorkingDays(val: string | null | undefined): number[] | null {
  if (val == null || String(val).trim() === '') return null;
  try {
    const arr = JSON.parse(String(val));
    if (Array.isArray(arr) && arr.every((x) => typeof x === 'number')) {
      return arr;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function timeAddMinutes(t: string, delta: number): string {
  const [h, m] = (t || '00:00').split(':').map(Number);
  let total = (h || 0) * 60 + (m || 0) + delta;
  if (total < 0) total += 24 * 60;
  total = total % (24 * 60);
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

export function getEffectiveSchedule(
  user: AttendanceUserScheduleInput | null | undefined,
  globalSettings: AttendanceSettingsMap,
): EffectiveSchedule {
  const workingDays =
    user?.workingDays != null ? parseWorkingDays(user.workingDays) : null;
  const shiftStart =
    user?.shiftStartTime != null && String(user.shiftStartTime).trim() !== ''
      ? String(user.shiftStartTime).trim()
      : getSettingTime(globalSettings, 'shift_start_time');
  const shiftEnd =
    user?.shiftEndTime != null && String(user.shiftEndTime).trim() !== ''
      ? String(user.shiftEndTime).trim()
      : getSettingTime(globalSettings, 'shift_end_time');
  const hasCustomShift =
    (user?.shiftStartTime != null &&
      String(user.shiftStartTime).trim() !== '') ||
    (user?.shiftEndTime != null && String(user.shiftEndTime).trim() !== '');
  const hasCustomZones =
    (user?.entryZoneStart != null &&
      String(user.entryZoneStart).trim() !== '') ||
    (user?.exitZoneStart != null && String(user.exitZoneStart).trim() !== '');
  const deriveZones = hasCustomShift && !hasCustomZones;

  return {
    working_days: workingDays ?? globalSettings.working_days,
    shift_start_time: shiftStart,
    shift_end_time: shiftEnd,
    entry_zone_start: deriveZones
      ? timeAddMinutes(shiftStart, -15)
      : user?.entryZoneStart != null &&
          String(user.entryZoneStart).trim() !== ''
        ? String(user.entryZoneStart).trim()
        : getSettingTime(globalSettings, 'entry_zone_start'),
    entry_zone_end: deriveZones
      ? shiftStart
      : user?.entryZoneEnd != null && String(user.entryZoneEnd).trim() !== ''
        ? String(user.entryZoneEnd).trim()
        : getSettingTime(globalSettings, 'entry_zone_end'),
    exit_zone_start: deriveZones
      ? timeAddMinutes(shiftEnd, -15)
      : user?.exitZoneStart != null && String(user.exitZoneStart).trim() !== ''
        ? String(user.exitZoneStart).trim()
        : getSettingTime(globalSettings, 'exit_zone_start'),
    exit_zone_end: deriveZones
      ? timeAddMinutes(shiftEnd, 30)
      : user?.exitZoneEnd != null && String(user.exitZoneEnd).trim() !== ''
        ? String(user.exitZoneEnd).trim()
        : getSettingTime(globalSettings, 'exit_zone_end'),
    late_zone_start_time: deriveZones
      ? shiftStart
      : user?.lateZoneStartTime != null &&
          String(user.lateZoneStartTime).trim() !== ''
        ? String(user.lateZoneStartTime).trim()
        : getSettingTime(globalSettings, 'late_zone_start_time'),
    late_zone_end_time: deriveZones
      ? timeAddMinutes(shiftStart, 15)
      : user?.lateZoneEndTime != null &&
          String(user.lateZoneEndTime).trim() !== ''
        ? String(user.lateZoneEndTime).trim()
        : getSettingTime(globalSettings, 'late_zone_end_time'),
    early_left_zone_start_time: deriveZones
      ? timeAddMinutes(shiftEnd, -30)
      : user?.earlyLeftZoneStartTime != null &&
          String(user.earlyLeftZoneStartTime).trim() !== ''
        ? String(user.earlyLeftZoneStartTime).trim()
        : getSettingTime(globalSettings, 'early_left_zone_start_time'),
    early_left_zone_end_time: deriveZones
      ? timeAddMinutes(shiftEnd, -15)
      : user?.earlyLeftZoneEndTime != null &&
          String(user.earlyLeftZoneEndTime).trim() !== ''
        ? String(user.earlyLeftZoneEndTime).trim()
        : getSettingTime(globalSettings, 'early_left_zone_end_time'),
  };
}

export function timeToMinutes(t: string): number {
  const [h, m] = (t || '00:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * True if time (0–1439) is inside [zoneStart, zoneEnd].
 * When start > end: if gap > 12h, midnight-crossing zone; else swapped same-day values.
 */
export function isInZone(
  timeMinutes: number,
  zoneStart: number,
  zoneEnd: number,
): boolean {
  if (zoneStart <= zoneEnd) {
    return timeMinutes >= zoneStart && timeMinutes <= zoneEnd;
  }
  const gap = zoneStart - zoneEnd;
  if (gap > 12 * 60) {
    return timeMinutes >= zoneStart || timeMinutes <= zoneEnd;
  }
  const lo = zoneEnd;
  const hi = zoneStart;
  return timeMinutes >= lo && timeMinutes <= hi;
}

function getPunchTypeForTime(
  timeMinutes: number,
  entryStart: number,
  entryEnd: number,
  lateStart: number,
  lateEnd: number,
  exitStart: number,
  exitEnd: number,
  earlyLeftStart: number,
  earlyLeftEnd: number,
  isEarlyExitDay: boolean,
  isLateEntryDay: boolean,
): PunchType {
  if (isInZone(timeMinutes, exitStart, exitEnd)) return 'exit';
  if (isInZone(timeMinutes, earlyLeftStart, earlyLeftEnd)) {
    if (isEarlyExitDay) return 'exit';
    return 'early_exit';
  }
  const inLateZone = isInZone(timeMinutes, lateStart, lateEnd);
  const inEntryZone = isInZone(timeMinutes, entryStart, entryEnd);
  if (inEntryZone && !inLateZone) return 'entry_on_time';
  if (inLateZone) return isLateEntryDay ? 'entry_on_time' : 'entry_late';
  return 'out_of_shift';
}

function getEffectivePunchType(
  record: AttendanceRecordInput,
  timeMinutes: number,
  entryStart: number,
  entryEnd: number,
  lateStart: number,
  lateEnd: number,
  exitStart: number,
  exitEnd: number,
  earlyLeftStart: number,
  earlyLeftEnd: number,
  isEarlyExitDay: boolean,
  isLateEntryDay: boolean,
): PunchType {
  const vt = (record.verifyType || '').toLowerCase();
  if (vt === 'manual_in') {
    const inLateZone = isInZone(timeMinutes, lateStart, lateEnd);
    return inLateZone && !isLateEntryDay ? 'entry_late' : 'entry_on_time';
  }
  if (vt === 'manual_out') {
    const inEarlyZone = isInZone(timeMinutes, earlyLeftStart, earlyLeftEnd);
    return inEarlyZone && !isEarlyExitDay ? 'early_exit' : 'exit';
  }
  return getPunchTypeForTime(
    timeMinutes,
    entryStart,
    entryEnd,
    lateStart,
    lateEnd,
    exitStart,
    exitEnd,
    earlyLeftStart,
    earlyLeftEnd,
    isEarlyExitDay,
    isLateEntryDay,
  );
}

export interface ClassifyPunchContext {
  settings: AttendanceSettingsMap;
  usersById: Map<string, AttendanceUserScheduleInput>;
  earlyExitDates: Set<string>;
  lateEntryDates: Set<string>;
}

export function classifyPunch(
  record: AttendanceRecordInput,
  ctx: ClassifyPunchContext,
): PunchType | null {
  const d = record.timestamp;
  if (Number.isNaN(d.getTime())) return null;
  const dateKey = getDateKeyFromTimestamp(d);
  const timeMinutes = getTimeMinutesFromTimestamp(d);
  const day = d.getDay();
  const sched = getEffectiveSchedule(
    ctx.usersById.get(record.deviceUserId),
    ctx.settings,
  );
  if (!sched.working_days.includes(day)) return null;

  const isEarlyExitDay = ctx.earlyExitDates.has(dateKey);
  const isLateEntryDay = ctx.lateEntryDates.has(dateKey);

  return getEffectivePunchType(
    record,
    timeMinutes,
    timeToMinutes(sched.entry_zone_start),
    timeToMinutes(sched.entry_zone_end),
    timeToMinutes(sched.late_zone_start_time),
    timeToMinutes(sched.late_zone_end_time),
    timeToMinutes(sched.exit_zone_start),
    timeToMinutes(sched.exit_zone_end),
    timeToMinutes(sched.early_left_zone_start_time),
    timeToMinutes(sched.early_left_zone_end_time),
    isEarlyExitDay,
    isLateEntryDay,
  );
}

export function getExpectedWorkingDates(
  fromDate: string,
  toDate: string,
  workingDays: number[],
  dayOffDates: { date: string }[],
): string[] {
  const dayOffSet = new Set(dayOffDates.map((h) => h.date));
  const result: string[] = [];
  const from = parseDateLocal(fromDate);
  const to = parseDateLocal(toDate);
  if (!from || !to || from > to) return result;

  const cur = new Date(from.getTime());
  while (cur <= to) {
    const dateKey = formatDateLocal(cur);
    if (workingDays.includes(cur.getDay()) && !dayOffSet.has(dateKey)) {
      result.push(dateKey);
    }
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

export function isRecordInDateRange(
  record: AttendanceRecordInput,
  fromDate: string,
  toDate: string,
): boolean {
  const d = record.timestamp;
  if (Number.isNaN(d.getTime())) return false;
  const dateKey = getDateKeyFromTimestamp(d);
  if (fromDate && dateKey < fromDate) return false;
  if (toDate && dateKey > toDate) return false;
  return true;
}

export interface BuildEmployeeReportInput {
  records: AttendanceRecordInput[];
  settings: AttendanceSettingsMap;
  users: AttendanceUserScheduleInput[];
  timeLeaveUsage: TimeLeaveUsageInput[];
  earlyExitDates: HolidayDateInput[];
  lateEntryDates: HolidayDateInput[];
  dayOffDates: HolidayDateInput[];
  employeeHolidays: EmployeeHolidayInput[];
  fromDate: string;
  toDate: string;
}

export function buildEmployeeReport(
  input: BuildEmployeeReportInput,
): EmployeeReportRow[] {
  const {
    records,
    settings,
    users,
    timeLeaveUsage,
    earlyExitDates,
    lateEntryDates,
    dayOffDates,
    employeeHolidays,
    fromDate,
    toDate,
  } = input;

  const usersMap = new Map(users.map((u) => [u.deviceUserId, u]));
  const earlyExitSet = new Set(
    earlyExitDates.map((h) => h.date),
  );
  const lateEntrySet = new Set(
    lateEntryDates.map((h) => h.date),
  );

  const filteredRecords = records.filter((r) =>
    isRecordInDateRange(r, fromDate, toDate),
  );

  const byUser: Record<
    string,
    {
      entryDates: Set<string>;
      exitDates: Set<string>;
      firstEntryMinutesByDate: Record<string, number>;
      firstEntryLateByDate: Record<string, boolean>;
      hasEarlyExitByDate: Record<string, boolean>;
    }
  > = {};

  for (const r of filteredRecords) {
    const d = r.timestamp;
    if (Number.isNaN(d.getTime())) continue;
    const dateKey = getDateKeyFromTimestamp(d);
    const day = d.getDay();
    const sched = getEffectiveSchedule(usersMap.get(r.deviceUserId), settings);
    if (!sched.working_days.includes(day)) continue;

    const timeMinutes = getTimeMinutesFromTimestamp(d);
    const isEarlyExitDay = earlyExitSet.has(dateKey);
    const isLateEntryDay = lateEntrySet.has(dateKey);
    const punchType = getEffectivePunchType(
      r,
      timeMinutes,
      timeToMinutes(sched.entry_zone_start),
      timeToMinutes(sched.entry_zone_end),
      timeToMinutes(sched.late_zone_start_time),
      timeToMinutes(sched.late_zone_end_time),
      timeToMinutes(sched.exit_zone_start),
      timeToMinutes(sched.exit_zone_end),
      timeToMinutes(sched.early_left_zone_start_time),
      timeToMinutes(sched.early_left_zone_end_time),
      isEarlyExitDay,
      isLateEntryDay,
    );

    if (!byUser[r.deviceUserId]) {
      byUser[r.deviceUserId] = {
        entryDates: new Set(),
        exitDates: new Set(),
        firstEntryMinutesByDate: {},
        firstEntryLateByDate: {},
        hasEarlyExitByDate: {},
      };
    }
    const u = byUser[r.deviceUserId];

    if (punchType === 'entry_on_time' || punchType === 'entry_late') {
      u.entryDates.add(dateKey);
      const prev = u.firstEntryMinutesByDate[dateKey];
      if (prev == null || timeMinutes < prev) {
        u.firstEntryMinutesByDate[dateKey] = timeMinutes;
        u.firstEntryLateByDate[dateKey] = punchType === 'entry_late';
      }
    } else if (punchType === 'exit' || punchType === 'early_exit') {
      u.exitDates.add(dateKey);
      if (punchType === 'early_exit') u.hasEarlyExitByDate[dateKey] = true;
    }
  }

  const coveredLateKeys = new Set(
    timeLeaveUsage
      .filter((u) => u.type === 'late_arrival')
      .map((u) => `${u.deviceUserId}|${u.date}`),
  );
  const coveredEarlyKeys = new Set(
    timeLeaveUsage
      .filter((u) => u.type === 'early_exit')
      .map((u) => `${u.deviceUserId}|${u.date}`),
  );

  const resolvedFromDate =
    fromDate ||
    (filteredRecords.length > 0
      ? filteredRecords.reduce((min, r) => {
          const key = getDateKeyFromTimestamp(r.timestamp);
          return key < min ? key : min;
        }, '9999-99-99')
      : '');
  const resolvedToDate =
    toDate ||
    (filteredRecords.length > 0
      ? filteredRecords.reduce((max, r) => {
          const key = getDateKeyFromTimestamp(r.timestamp);
          return key > max ? key : max;
        }, '0000-00-00')
      : '');

  const userIds = new Set(users.map((u) => u.deviceUserId));
  for (const uid of Object.keys(byUser)) userIds.add(uid);

  return Array.from(userIds).map((deviceUserId) => {
    const o = byUser[deviceUserId];
    const sched = getEffectiveSchedule(usersMap.get(deviceUserId), settings);
    const expectedDates =
      resolvedFromDate && resolvedToDate
        ? getExpectedWorkingDates(
            resolvedFromDate,
            resolvedToDate,
            sched.working_days,
            dayOffDates,
          )
        : [];
    const expectedDatesSet = new Set(expectedDates);

    let daysPresent = 0;
    let lateCount = 0;
    if (o) {
      const validDates = new Set<string>();
      for (const dateKey of o.entryDates) {
        if (!o.exitDates.has(dateKey)) continue;
        const hasLate = o.firstEntryLateByDate[dateKey] === true;
        const hasEarlyExit = o.hasEarlyExitByDate[dateKey] === true;
        const lateCovered =
          !hasLate || coveredLateKeys.has(`${deviceUserId}|${dateKey}`);
        const earlyCovered =
          !hasEarlyExit ||
          coveredEarlyKeys.has(`${deviceUserId}|${dateKey}`);
        if (lateCovered && earlyCovered) validDates.add(dateKey);
        if (hasLate && !coveredLateKeys.has(`${deviceUserId}|${dateKey}`)) {
          lateCount++;
        }
      }
      daysPresent = validDates.size;
    }

    const empHolidayCount = employeeHolidays.filter(
      (h) =>
        h.deviceUserId === deviceUserId && expectedDatesSet.has(h.date),
    ).length;
    const expectedCountForEmployee = expectedDates.length - empHolidayCount;
    const daysAbsent = Math.max(0, expectedCountForEmployee - daysPresent);

    return {
      deviceUserId,
      working_days_present: daysPresent,
      late_count: lateCount,
      expected_working_days: expectedCountForEmployee,
      days_absent: daysAbsent,
    };
  });
}

export function findLateOccurrences(input: {
  records: AttendanceRecordInput[];
  settings: AttendanceSettingsMap;
  users: AttendanceUserScheduleInput[];
  timeLeaveUsage: TimeLeaveUsageInput[];
  earlyExitDates: HolidayDateInput[];
  lateEntryDates: HolidayDateInput[];
  fromDate: string;
  toDate: string;
}): LateOccurrence[] {
  const usersMap = new Map(input.users.map((u) => [u.deviceUserId, u]));
  const earlyExitSet = new Set(input.earlyExitDates.map((h) => h.date));
  const lateEntrySet = new Set(input.lateEntryDates.map((h) => h.date));
  const coveredTimestamps = new Set(
    input.timeLeaveUsage
      .filter((u) => u.type === 'late_arrival')
      .map((u) => u.timestamp),
  );

  const filteredRecords = input.records.filter((r) =>
    isRecordInDateRange(r, input.fromDate, input.toDate),
  );

  const byUserDate: Record<
    string,
    { day: number; minTs: number; timeMinutes: number; timestamp: string }
  > = {};

  for (const r of filteredRecords) {
    const d = r.timestamp;
    if (Number.isNaN(d.getTime())) continue;
    const dateKey = getDateKeyFromTimestamp(d);
    const day = d.getDay();
    const sched = getEffectiveSchedule(usersMap.get(r.deviceUserId), input.settings);
    if (!sched.working_days.includes(day)) continue;

    const timeMinutes = getTimeMinutesFromTimestamp(d);
    const punchType = getEffectivePunchType(
      r,
      timeMinutes,
      timeToMinutes(sched.entry_zone_start),
      timeToMinutes(sched.entry_zone_end),
      timeToMinutes(sched.late_zone_start_time),
      timeToMinutes(sched.late_zone_end_time),
      timeToMinutes(sched.exit_zone_start),
      timeToMinutes(sched.exit_zone_end),
      timeToMinutes(sched.early_left_zone_start_time),
      timeToMinutes(sched.early_left_zone_end_time),
      earlyExitSet.has(dateKey),
      lateEntrySet.has(dateKey),
    );
    if (punchType !== 'entry_on_time' && punchType !== 'entry_late') continue;

    const key = `${r.deviceUserId}|${dateKey}`;
    const ts = getTimestampMillis(d);
    if (!byUserDate[key] || ts < byUserDate[key].minTs) {
      byUserDate[key] = {
        day,
        minTs: ts,
        timeMinutes,
        timestamp: formatLocalTimestamp(d),
      };
    }
  }

  const result: LateOccurrence[] = [];
  for (const [key, v] of Object.entries(byUserDate)) {
    const [deviceUserId, dateKey] = key.split('|');
    const sched = getEffectiveSchedule(usersMap.get(deviceUserId), input.settings);
    if (!sched.working_days.includes(v.day)) continue;
    if (lateEntrySet.has(dateKey)) continue;
    const lateStart = timeToMinutes(sched.late_zone_start_time);
    const lateEnd = timeToMinutes(sched.late_zone_end_time);
    const inLate = isInZone(v.timeMinutes, lateStart, lateEnd);
    if (inLate && !coveredTimestamps.has(v.timestamp)) {
      result.push({ deviceUserId, date: dateKey });
    }
  }
  return result;
}

export function findEarlyExitOccurrences(input: {
  records: AttendanceRecordInput[];
  settings: AttendanceSettingsMap;
  users: AttendanceUserScheduleInput[];
  timeLeaveUsage: TimeLeaveUsageInput[];
  earlyExitDates: HolidayDateInput[];
  lateEntryDates: HolidayDateInput[];
  fromDate: string;
  toDate: string;
}): EarlyExitOccurrence[] {
  const usersMap = new Map(input.users.map((u) => [u.deviceUserId, u]));
  const earlyExitSet = new Set(input.earlyExitDates.map((h) => h.date));
  const lateEntrySet = new Set(input.lateEntryDates.map((h) => h.date));
  const coveredEarlyKeys = new Set(
    input.timeLeaveUsage
      .filter((u) => u.type === 'early_exit')
      .map((u) => `${u.deviceUserId}|${u.date}`),
  );

  const filteredRecords = input.records.filter((r) =>
    isRecordInDateRange(r, input.fromDate, input.toDate),
  );

  const byUserDate: Record<
    string,
    { day: number; maxTs: number; timestamp: string }
  > = {};

  for (const r of filteredRecords) {
    const d = r.timestamp;
    if (Number.isNaN(d.getTime())) continue;
    const dateKey = getDateKeyFromTimestamp(d);
    const day = d.getDay();
    const sched = getEffectiveSchedule(usersMap.get(r.deviceUserId), input.settings);
    if (!sched.working_days.includes(day)) continue;

    const timeMinutes = getTimeMinutesFromTimestamp(d);
    const punchType = getEffectivePunchType(
      r,
      timeMinutes,
      timeToMinutes(sched.entry_zone_start),
      timeToMinutes(sched.entry_zone_end),
      timeToMinutes(sched.late_zone_start_time),
      timeToMinutes(sched.late_zone_end_time),
      timeToMinutes(sched.exit_zone_start),
      timeToMinutes(sched.exit_zone_end),
      timeToMinutes(sched.early_left_zone_start_time),
      timeToMinutes(sched.early_left_zone_end_time),
      earlyExitSet.has(dateKey),
      lateEntrySet.has(dateKey),
    );
    if (punchType !== 'early_exit') continue;

    const key = `${r.deviceUserId}|${dateKey}`;
    const ts = getTimestampMillis(d);
    if (!byUserDate[key] || ts > byUserDate[key].maxTs) {
      byUserDate[key] = {
        day,
        maxTs: ts,
        timestamp: formatLocalTimestamp(d),
      };
    }
  }

  const result: EarlyExitOccurrence[] = [];
  for (const [key, v] of Object.entries(byUserDate)) {
    const [deviceUserId, dateKey] = key.split('|');
    const sched = getEffectiveSchedule(usersMap.get(deviceUserId), input.settings);
    if (!sched.working_days.includes(v.day)) continue;
    if (coveredEarlyKeys.has(`${deviceUserId}|${dateKey}`)) continue;
    result.push({ deviceUserId, date: dateKey, timestamp: v.timestamp });
  }
  return result;
}

/** Format timestamp as local wall-clock ISO-like string (no Z suffix). */
export function formatLocalTimestamp(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  const ms = String(d.getMilliseconds()).padStart(3, '0');
  return `${y}-${mo}-${day}T${h}:${mi}:${s}.${ms}`;
}

/** Parse input as local wall-clock (ignores trailing Z if present). */
export function parseLocalTimestamp(input: string): Date | null {
  const s = String(input || '').trim();
  if (!s) return null;
  const withoutZ = s.replace(/Z$/i, '');
  const match = withoutZ.match(
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.(\d{1,3}))?$/,
  );
  if (!match) return null;
  const y = parseInt(match[1], 10);
  const mo = parseInt(match[2], 10) - 1;
  const day = parseInt(match[3], 10);
  const h = parseInt(match[4], 10);
  const mi = parseInt(match[5], 10);
  const se = parseInt(match[6] ?? '0', 10);
  const msRaw = match[7] ?? '0';
  const ms = parseInt(msRaw.padEnd(3, '0').slice(0, 3), 10);
  const d = new Date(y, mo, day, h, mi, se, ms);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function parseLocalDateToDbDate(dateStr: string): Date | null {
  const d = parseDateLocal(dateStr);
  return d;
}

export function dateRangeBounds(fromDate?: string, toDate?: string): {
  from?: Date;
  to?: Date;
} {
  const from = fromDate ? parseDateLocal(fromDate) : undefined;
  const to = toDate ? parseDateLocal(toDate) : undefined;
  if (to) {
    to.setHours(23, 59, 59, 999);
  }
  return { from: from ?? undefined, to: to ?? undefined };
}

export interface EmployeeDayRow {
  date: string;
  entryTime: string | null;
  exitTime: string | null;
  entryType: PunchType | null;
  exitType: PunchType | null;
  isHoliday?: boolean;
  isNotComing?: boolean;
}

export function buildEmployeeDayRows(input: {
  deviceUserId: string;
  records: AttendanceRecordInput[];
  settings: AttendanceSettingsMap;
  user?: AttendanceUserScheduleInput;
  usersById?: Map<string, AttendanceUserScheduleInput>;
  dayOffDates: { date: string }[];
  employeeHolidayDates: string[];
  earlyExitDates: Set<string>;
  lateEntryDates: Set<string>;
  fromDate: string;
  toDate: string;
}): EmployeeDayRow[] {
  const {
    deviceUserId,
    records,
    settings,
    user,
    usersById,
    dayOffDates,
    employeeHolidayDates,
    earlyExitDates,
    lateEntryDates,
  } = input;

  let fromDate = input.fromDate;
  let toDate = input.toDate;
  if (!fromDate || !toDate) {
    const keys = records
      .filter((record) => record.deviceUserId === deviceUserId)
      .map((record) => getDateKeyFromTimestamp(record.timestamp));
    if (keys.length > 0) {
      fromDate = fromDate || keys.reduce((a, b) => (a < b ? a : b));
      toDate = toDate || keys.reduce((a, b) => (a > b ? a : b));
    }
  }

  const sched = getEffectiveSchedule(user, settings);
  const expected = getExpectedWorkingDates(
    fromDate,
    toDate,
    sched.working_days,
    dayOffDates,
  );
  const holidaySet = new Set(employeeHolidayDates);
  const ctx: ClassifyPunchContext = {
    settings,
    usersById: usersById ?? new Map(user ? [[user.deviceUserId, user]] : []),
    earlyExitDates,
    lateEntryDates,
  };

  const byDate = new Map<string, AttendanceRecordInput[]>();
  for (const record of records) {
    if (record.deviceUserId !== deviceUserId) continue;
    if (!isRecordInDateRange(record, fromDate, toDate)) continue;
    const dateKey = getDateKeyFromTimestamp(record.timestamp);
    const list = byDate.get(dateKey) ?? [];
    list.push(record);
    byDate.set(dateKey, list);
  }

  const rows: EmployeeDayRow[] = [];
  for (const dateKey of expected) {
    if (holidaySet.has(dateKey)) {
      rows.push({
        date: dateKey,
        entryTime: null,
        exitTime: null,
        entryType: null,
        exitType: null,
        isHoliday: true,
      });
      continue;
    }

    const punches = [...(byDate.get(dateKey) ?? [])].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );
    const types = punches.map((punch) => classifyPunch(punch, ctx));
    const allOutOfShift =
      punches.length > 0 &&
      types.every((type) => type === 'out_of_shift' || type == null);

    if (punches.length === 0 || allOutOfShift) {
      rows.push({
        date: dateKey,
        entryTime: null,
        exitTime: null,
        entryType: null,
        exitType: null,
        isNotComing: true,
      });
      continue;
    }

    const entryPunches = punches.filter((_, index) => {
      const type = types[index];
      return type === 'entry_on_time' || type === 'entry_late';
    });
    const exitPunches = punches.filter((_, index) => {
      const type = types[index];
      return type === 'exit' || type === 'early_exit';
    });
    const entry = entryPunches[0] ?? null;
    const exit =
      exitPunches.length > 0 ? exitPunches[exitPunches.length - 1] : null;

    rows.push({
      date: dateKey,
      entryTime: entry ? formatLocalTimestamp(entry.timestamp) : null,
      exitTime: exit ? formatLocalTimestamp(exit.timestamp) : null,
      entryType: entry ? classifyPunch(entry, ctx) : null,
      exitType: exit ? classifyPunch(exit, ctx) : null,
    });
  }

  return rows;
}
