import type { AttendanceRecord, AttendanceSettings, TimeLeaveType, TimeLeaveUsage } from '@/lib/types/attendance';
import { buildLocalTimestamp, timestampToDateKey } from '@/lib/attendance/formatters';

export function findLateCoverTimestamp(
  records: AttendanceRecord[],
  deviceUserId: string,
  date: string,
  settings: AttendanceSettings,
): string {
  const match = records.find(
    (r) =>
      r.deviceUserId === deviceUserId && timestampToDateKey(r.timestamp) === date,
  );
  if (match) return match.timestamp;
  const fallbackTime = settings.shiftStartTime || '08:00';
  return buildLocalTimestamp(date, fallbackTime);
}

export function isLateArrivalCovered(
  entryTimestamp: string,
  timeLeaveUsage: TimeLeaveUsage[],
): boolean {
  return timeLeaveUsage.some(
    (u) => u.type === 'late_arrival' && u.timestamp === entryTimestamp,
  );
}

export function lateArrivalCoverId(
  entryTimestamp: string,
  timeLeaveUsage: TimeLeaveUsage[],
): string | null {
  return (
    timeLeaveUsage.find(
      (u) => u.type === 'late_arrival' && u.timestamp === entryTimestamp,
    )?.id ?? null
  );
}

export function isEarlyExitCovered(
  deviceUserId: string,
  date: string,
  timeLeaveUsage: TimeLeaveUsage[],
): boolean {
  return timeLeaveUsage.some(
    (u) =>
      u.type === 'early_exit' &&
      u.deviceUserId === deviceUserId &&
      u.date === date,
  );
}

export function earlyExitCoverId(
  deviceUserId: string,
  date: string,
  timeLeaveUsage: TimeLeaveUsage[],
): string | null {
  return (
    timeLeaveUsage.find(
      (u) =>
        u.type === 'early_exit' &&
        u.deviceUserId === deviceUserId &&
        u.date === date,
    )?.id ?? null
  );
}

export function filterUncoveredLateForEmployee(
  deviceUserId: string,
  lateOccurrences: { deviceUserId: string; date: string }[],
): { deviceUserId: string; date: string }[] {
  return lateOccurrences.filter((o) => o.deviceUserId === deviceUserId);
}

export function filterUncoveredEarlyForEmployee(
  deviceUserId: string,
  earlyExitOccurrences: {
    deviceUserId: string;
    date: string;
    timestamp: string;
  }[],
): typeof earlyExitOccurrences {
  return earlyExitOccurrences.filter((o) => o.deviceUserId === deviceUserId);
}

export type { TimeLeaveType };
