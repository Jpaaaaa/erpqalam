import type { PunchType } from '@/lib/types/attendance';

export const PUNCH_TYPE_TONE: Record<
  PunchType,
  { badge: string; row: string }
> = {
  entry_on_time: {
    badge: 'bg-emerald-100 text-emerald-800',
    row: '',
  },
  entry_late: {
    badge: 'bg-amber-100 text-amber-800',
    row: 'bg-amber-50/50',
  },
  exit: {
    badge: 'bg-slate-100 text-slate-700',
    row: '',
  },
  early_exit: {
    badge: 'bg-orange-100 text-orange-800',
    row: 'bg-orange-50/50',
  },
  out_of_shift: {
    badge: 'bg-slate-100 text-slate-500',
    row: '',
  },
};
