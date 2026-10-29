import type { AppLocale } from '../i18n/locales';
import { AR_MONTH_NAMES, KU_MONTH_NAMES } from '../i18n/calendarMonths';

function parseParts(dateKey: string): { d: number; m: number; y: number } | null {
  const parts = dateKey.split('-').map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  return { y: parts[0], d: parts[2], m: parts[1] - 1 };
}

function dayWithMonth(locale: AppLocale, day: number, monthIndex: number): string {
  if (locale === 'ku') {
    return `${day}ی ${KU_MONTH_NAMES[monthIndex]}`;
  }
  if (locale === 'ar') {
    return `${day} ${AR_MONTH_NAMES[monthIndex]}`;
  }
  const en = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${en[monthIndex]} ${day}`;
}

/** e.g. "1 – 3ی تشرینی دووەم" (local month names). */
export function formatHolidayDateRangeWords(
  locale: AppLocale,
  fromDate: string,
  toDate: string,
): string {
  const from = parseParts(fromDate);
  const to = parseParts(toDate);
  if (!from || !to) return fromDate;
  if (fromDate === toDate) {
    return dayWithMonth(locale, from.d, from.m);
  }
  if (from.m === to.m && from.y === to.y) {
    return `${from.d} – ${dayWithMonth(locale, to.d, to.m)}`;
  }
  return `${dayWithMonth(locale, from.d, from.m)} – ${dayWithMonth(locale, to.d, to.m)}`;
}
