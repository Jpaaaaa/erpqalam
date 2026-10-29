import type { DailyAttendanceRow, MergedAttendanceEmployee } from '../../types/attendance';

export type EmployeeStatusFilter =
  | 'all'
  | 'present'
  | 'late'
  | 'absent'
  | 'on_leave'
  | 'unregistered';

const PRESENT_STATUSES = new Set(['on_time', 'late', 'early_exit']);

export function matchesEmployeeFilter(
  employee: MergedAttendanceEmployee,
  filter: EmployeeStatusFilter,
  todayRow?: DailyAttendanceRow,
): boolean {
  if (filter === 'all') return true;
  if (filter === 'unregistered') return employee.isUnregistered;
  if (employee.isUnregistered) return false;

  const status = todayRow?.status;
  if (!status) return filter === 'absent';

  switch (filter) {
    case 'present':
      return PRESENT_STATUSES.has(status);
    case 'late':
      return status === 'late';
    case 'absent':
      return status === 'absent';
    case 'on_leave':
      return status === 'on_leave';
    default:
      return true;
  }
}

export function avatarStyleForToday(
  employee: MergedAttendanceEmployee,
  todayRow: DailyAttendanceRow | undefined,
  isDark: boolean,
): { bg: string; ink: string; dashed?: boolean } {
  if (employee.isUnregistered) {
    return {
      bg: isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(148, 163, 184, 0.16)',
      ink: isDark ? '#94A3B8' : '#64748B',
      dashed: true,
    };
  }

  const status = todayRow?.status;
  switch (status) {
    case 'on_time':
    case 'early_exit':
      return {
        bg: isDark ? 'rgba(20, 184, 166, 0.28)' : 'rgba(20, 184, 166, 0.16)',
        ink: '#14B8A6',
      };
    case 'late':
      return {
        bg: isDark ? 'rgba(245, 158, 11, 0.28)' : 'rgba(245, 158, 11, 0.2)',
        ink: '#D97706',
      };
    case 'absent':
      return {
        bg: isDark ? 'rgba(239, 68, 68, 0.24)' : 'rgba(239, 68, 68, 0.14)',
        ink: '#DC2626',
      };
    case 'on_leave':
      return {
        bg: isDark ? 'rgba(139, 92, 246, 0.28)' : 'rgba(139, 92, 246, 0.16)',
        ink: '#7C3AED',
      };
    default:
      return {
        bg: isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(148, 163, 184, 0.12)',
        ink: isDark ? '#94A3B8' : '#64748B',
      };
  }
}
