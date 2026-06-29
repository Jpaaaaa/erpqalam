import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ar', 'ku'],
  defaultLocale: 'en',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];

export const rtlLocales: Locale[] = ['ar', 'ku'];

export const localeLabels: Record<Locale | 'tr', string> = {
  en: 'English',
  ar: 'العربية',
  ku: 'کوردی',
  tr: 'Türkçe',
};

/** Enable in routing.locales when Turkish translations are ready */
export const futureLocales = ['tr'] as const;
