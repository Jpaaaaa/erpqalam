import type { DailyAttendanceRow, DailyAttendanceStatus } from '../types/attendance';

export const DAILY_ATTENTION_STATUSES: ReadonlySet<DailyAttendanceStatus> = new Set([
  'late',
  'absent',
  'early_exit',
]);

export function isDailyAttentionStatus(status: DailyAttendanceStatus): boolean {
  return DAILY_ATTENTION_STATUSES.has(status);
}

export function filterDailyAttentionRows(rows: DailyAttendanceRow[]): DailyAttendanceRow[] {
  return rows.filter((row) => isDailyAttentionStatus(row.status));
}
