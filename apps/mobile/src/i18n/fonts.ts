import {
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import {
  NotoSansArabic_500Medium,
  NotoSansArabic_700Bold,
} from '@expo-google-fonts/noto-sans-arabic';
import type { AppLocale } from './locales';

export const FONT_ASSETS = {
  Rudaw: require('../../assets/fonts/rudaw-regular.ttf'),
  'Rudaw-Bold': require('../../assets/fonts/rudaw-bold.ttf'),
  Tajawal: require('../../assets/fonts/Tajawal-Regular.ttf'),
  'Tajawal-Bold': require('../../assets/fonts/Tajawal-Bold.ttf'),
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  NotoSansArabic_500Medium,
  NotoSansArabic_700Bold,
} as const;

export const APP_TYPOGRAPHY = {
  inter: {
    semibold: 'Inter_600SemiBold',
    bold: 'Inter_700Bold',
    extraBold: 'Inter_800ExtraBold',
  },
  noto: {
    medium: 'NotoSansArabic_500Medium',
    bold: 'NotoSansArabic_700Bold',
  },
} as const;

export type AppTypography = typeof APP_TYPOGRAPHY;

export function fontFamiliesForLocale(locale: AppLocale): {
  regular?: string;
  bold?: string;
} {
  if (locale === 'ku') return { regular: 'Rudaw', bold: 'Rudaw-Bold' };
  if (locale === 'ar') return { regular: 'Tajawal', bold: 'Tajawal-Bold' };
  return {};
}
