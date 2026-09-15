import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar.json';
import en from './locales/en.json';
import ku from './locales/ku.json';
import { DEFAULT_LOCALE } from './locales';

/**
 * TECH DEBT: `locales/*.json` are copied slices of `apps/web/messages`.
 * Do not Metro-import the web files (Next.js / next-intl). Interpolation
 * uses `{name}` like next-intl, not i18next's default `{{name}}`.
 */
export const i18nReady = i18n.use(initReactI18next).init({
  resources: {
    ku: { ...ku },
    ar: { ...ar },
    en: { ...en },
  },
  lng: DEFAULT_LOCALE,
  fallbackLng: 'en',
  ns: ['common', 'auth', 'hr', 'attendance', 'mobile'],
  defaultNS: 'common',
  interpolation: {
    prefix: '{',
    suffix: '}',
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

export { i18n };
