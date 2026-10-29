import type { DailyAttendanceRow } from '../types/attendance';

export type DailyStatusFilter =
  | 'all'
  | 'present'
  | 'late'
  | 'absent'
  | 'early_exit'
  | 'on_leave';

const PRESENT = new Set<DailyAttendanceRow['status']>([
  'on_time',
  'late',
  'early_exit',
]);

export function matchesDailyStatusFilter(
  row: DailyAttendanceRow,
  filter: DailyStatusFilter,
): boolean {
  if (filter === 'all') return true;
  if (filter === 'present') return PRESENT.has(row.status);
  if (filter === 'late') return row.status === 'late';
  if (filter === 'absent') return row.status === 'absent';
  if (filter === 'early_exit') return row.status === 'early_exit';
  if (filter === 'on_leave') return row.status === 'on_leave';
  return true;
}
