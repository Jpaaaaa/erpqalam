import type { AttendanceHolidayType } from '../../types/attendance';

export function holidayTypeColor(type: AttendanceHolidayType): string {
  switch (type) {
    case 'day_off':
      return '#7C3AED';
    case 'entry_late':
      return '#D97706';
    case 'early_exit':
      return '#2563EB';
    default:
      return '#64748B';
  }
}

export function holidayTypeTileBg(type: AttendanceHolidayType, isDark: boolean): string {
  const c = holidayTypeColor(type);
  if (type === 'day_off') {
    return isDark ? 'rgba(124, 58, 237, 0.28)' : 'rgba(124, 58, 237, 0.14)';
  }
  if (type === 'entry_late') {
    return isDark ? 'rgba(217, 119, 6, 0.28)' : 'rgba(245, 158, 11, 0.18)';
  }
  return isDark ? 'rgba(37, 99, 235, 0.28)' : 'rgba(37, 99, 235, 0.14)';
}
