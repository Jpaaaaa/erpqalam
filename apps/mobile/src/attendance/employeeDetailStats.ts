import type { AttendanceRecord, AttendanceUser, DateFilter } from '../types/attendance';
import { formatTime24, shiftDateKey } from './formatters';

export function countInclusiveDays(fromDate: string, toDate: string): number {
  let count = 0;
  let d = fromDate;
  while (d <= toDate) {
    count += 1;
    d = shiftDateKey(d, 1);
  }
  return count;
}

export function previousPeriodRange(fromDate: string, toDate: string): DateFilter {
  const span = countInclusiveDays(fromDate, toDate);
  const prevTo = shiftDateKey(fromDate, -1);
  const prevFrom = shiftDateKey(fromDate, -span);
  return { fromDate: prevFrom, toDate: prevTo };
}

export function attendanceRate(present: number, expected: number): number {
  if (expected <= 0) return 0;
  return Math.round((present / expected) * 100);
}

export function punctualityRate(present: number, lateCount: number): number {
  if (present <= 0) return 0;
  const onTimeDays = Math.max(0, present - lateCount);
  return Math.round((onTimeDays / present) * 100);
}

export function leaveUsedPercent(used: number, annual: number): number {
  if (annual <= 0) return 0;
  return Math.min(100, Math.round((used / annual) * 100));
}

function parseShiftMinutes(hhmm: string): number | null {
  const [h, m] = hhmm.split(':').map((p) => parseInt(p, 10));
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function timestampLocalMinutes(ts: string): number | null {
  const match = ts.match(/T(\d{2}):(\d{2})/);
  if (!match) return null;
  return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

export function averageEntryTime24(records: AttendanceRecord[]): string | null {
  const entryTypes = new Set(['entry_on_time', 'entry_late']);
  const byDay = new Map<string, AttendanceRecord>();
  for (const r of records) {
    if (r.punchType && !entryTypes.has(r.punchType)) continue;
    if (r.ignoredDuplicate) continue;
    const day = r.timestamp.slice(0, 10);
    const prev = byDay.get(day);
    if (!prev || r.timestamp < prev.timestamp) byDay.set(day, r);
  }
  const mins: number[] = [];
  for (const r of byDay.values()) {
    const m = timestampLocalMinutes(r.timestamp);
    if (m != null) mins.push(m);
  }
  if (mins.length === 0) return null;
  const avg = Math.round(mins.reduce((a, b) => a + b, 0) / mins.length);
  const h = Math.floor(avg / 60)
    .toString()
    .padStart(2, '0');
  const mi = (avg % 60).toString().padStart(2, '0');
  return `${h}:${mi}`;
}

export function totalLateMinutes(
  records: AttendanceRecord[],
  user: AttendanceUser | undefined,
  fallbackShiftStart: string,
): number {
  const shiftStart = user?.shiftStartTime?.trim() || fallbackShiftStart;
  const startMin = parseShiftMinutes(shiftStart);
  if (startMin == null) return 0;
  const byDay = new Map<string, AttendanceRecord>();
  for (const r of records) {
    if (r.punchType !== 'entry_late') continue;
    if (r.ignoredDuplicate) continue;
    const day = r.timestamp.slice(0, 10);
    const prev = byDay.get(day);
    if (!prev || r.timestamp < prev.timestamp) byDay.set(day, r);
  }
  let total = 0;
  for (const r of byDay.values()) {
    const t = timestampLocalMinutes(r.timestamp);
    if (t == null || t <= startMin) continue;
    total += t - startMin;
  }
  return total;
}

export function formatEntryTimeShort(ts: string | null | undefined): string | null {
  if (!ts) return null;
  return formatTime24(ts);
}

export function isManualVerify(verifyType: string): boolean {
  return verifyType.toLowerCase().includes('manual');
}

export function trendDeltaPercent(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}
