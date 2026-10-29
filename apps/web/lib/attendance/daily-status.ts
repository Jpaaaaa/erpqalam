import type { DailyAttendanceStatus } from '@/lib/types/attendance';

export const DAILY_STATUS_TONE: Record<
  DailyAttendanceStatus,
  { badge: string; row: string }
> = {
  on_time: {
    badge: 'bg-emerald-100 text-emerald-800',
    row: '',
  },
  late: {
    badge: 'bg-amber-100 text-amber-800',
    row: 'bg-amber-50/40',
  },
  early_exit: {
    badge: 'bg-orange-100 text-orange-800',
    row: 'bg-orange-50/40',
  },
  absent: {
    badge: 'bg-red-100 text-red-800',
    row: 'bg-red-50/40',
  },
  on_leave: {
    badge: 'bg-blue-100 text-blue-800',
    row: 'bg-blue-50/40',
  },
  official_holiday: {
    badge: 'bg-indigo-100 text-indigo-800',
    row: 'bg-indigo-50/40',
  },
  day_off: {
    badge: 'bg-slate-100 text-slate-600',
    row: 'bg-slate-50/80',
  },
};
