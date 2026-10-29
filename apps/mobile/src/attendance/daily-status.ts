import type { DailyAttendanceStatus } from '../types/attendance';

export const DAILY_STATUS_BADGE: Record<
  DailyAttendanceStatus,
  { backgroundColor: string; color: string }
> = {
  on_time: { backgroundColor: '#d1fae5', color: '#065f46' },
  late: { backgroundColor: '#fef3c7', color: '#92400e' },
  early_exit: { backgroundColor: '#ffedd5', color: '#9a3412' },
  absent: { backgroundColor: '#fee2e2', color: '#991b1b' },
  on_leave: { backgroundColor: '#dbeafe', color: '#1e40af' },
  official_holiday: { backgroundColor: '#e0e7ff', color: '#3730a3' },
  day_off: { backgroundColor: '#f1f5f9', color: '#475569' },
};
