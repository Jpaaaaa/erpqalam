import type { EmployeeReportRow } from '../../types/attendance';
import type { PerformanceSortKey } from './ReportPerformanceSortChips';

export function rowAttendancePct(row: EmployeeReportRow): number {
  if (row.expectedWorkingDays <= 0) return 0;
  return Math.round((row.workingDaysPresent / row.expectedWorkingDays) * 100);
}

export function attendancePctColor(pct: number): string {
  if (pct >= 90) return '#14B8A6';
  if (pct >= 75) return '#D97706';
  return '#EF4444';
}

export function sortPerformanceRows(
  rows: EmployeeReportRow[],
  sort: PerformanceSortKey,
): EmployeeReportRow[] {
  const copy = [...rows];
  copy.sort((a, b) => {
    if (sort === 'attendance') {
      return rowAttendancePct(b) - rowAttendancePct(a);
    }
    if (sort === 'late') {
      return b.lateCount - a.lateCount;
    }
    return b.daysAbsent - a.daysAbsent;
  });
  return copy;
}
