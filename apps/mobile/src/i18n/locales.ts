export const APP_LOCALES = ['ku', 'ar', 'en'] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'ku';

export const LOCALE_STORAGE_KEY = 'erpqalam_locale';

export const RTL_RELOAD_ATTEMPTED_KEY = 'erpqalam_rtl_reload_attempted';

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return value === 'ku' || value === 'ar' || value === 'en';
}

/** Kurdish and Arabic are RTL. Do not use I18nManager.isRTL for this. */
export function isRtlLocale(locale: AppLocale): boolean {
  return locale === 'ku' || locale === 'ar';
}
