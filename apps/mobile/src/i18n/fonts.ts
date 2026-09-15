import type { AppLocale } from './locales';

export const FONT_ASSETS = {
  Rudaw: require('../../assets/fonts/rudaw-regular.ttf'),
  'Rudaw-Bold': require('../../assets/fonts/rudaw-bold.ttf'),
  Tajawal: require('../../assets/fonts/Tajawal-Regular.ttf'),
  'Tajawal-Bold': require('../../assets/fonts/Tajawal-Bold.ttf'),
} as const;

export function fontFamiliesForLocale(locale: AppLocale): {
  regular?: string;
  bold?: string;
} {
  if (locale === 'ku') return { regular: 'Rudaw', bold: 'Rudaw-Bold' };
  if (locale === 'ar') return { regular: 'Tajawal', bold: 'Tajawal-Bold' };
  return {};
}
