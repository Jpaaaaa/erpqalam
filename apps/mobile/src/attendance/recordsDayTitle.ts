import { AR_MONTH_NAMES, KU_MONTH_NAMES } from '../i18n/calendarMonths';
import type { AppLocale } from '../i18n/locales';

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export function formatRecordsDayHeading(
  dateKey: string,
  locale: AppLocale,
  t: (key: string) => string,
): string {
  const parts = dateKey.split('-').map((p) => parseInt(p, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return dateKey;
  const [year, monthIndex, day] = parts;
  const date = new Date(year, monthIndex - 1, day);
  const dow = WEEKDAY_KEYS[date.getDay()];
  const weekday = t(`calendar.weekdaysLong.${dow}`);

  if (locale === 'ku') {
    return `${weekday}، ${day}ی ${KU_MONTH_NAMES[monthIndex - 1]}`;
  }
  if (locale === 'ar') {
    return `${weekday}، ${day} ${AR_MONTH_NAMES[monthIndex - 1]}`;
  }
  const month = new Intl.DateTimeFormat('en', { month: 'long' }).format(date);
  return `${weekday}, ${month} ${day}, ${year}`;
}
