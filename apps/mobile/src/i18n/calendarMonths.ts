import type { AppLocale } from './locales';

/** Sorani Kurdish month names (1 = January … 12 = December). */
export const KU_MONTH_NAMES = [
  'کانوونی دووەم',
  'شوبات',
  'ئازار',
  'نیسان',
  'ئایار',
  'حوزەیران',
  'تەممووز',
  'ئاب',
  'ئەیلول',
  'تشرینی یەکەم',
  'تشرینی دووەم',
  'کانوونی یەکەم',
] as const;

/** Iraqi Arabic month names (1 = January … 12 = December). */
export const AR_MONTH_NAMES = [
  'كانون الثاني',
  'شباط',
  'آذار',
  'نيسان',
  'أيار',
  'حزيران',
  'تموز',
  'آب',
  'أيلول',
  'تشرين الأول',
  'تشرين الثاني',
  'كانون الأول',
] as const;

export function monthYearLabel(locale: AppLocale, year: number, monthIndex: number): string {
  if (locale === 'ku') {
    return `${KU_MONTH_NAMES[monthIndex]} ${year}`;
  }
  if (locale === 'ar') {
    return `${AR_MONTH_NAMES[monthIndex]} ${year}`;
  }
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(
    new Date(year, monthIndex, 1),
  );
}
