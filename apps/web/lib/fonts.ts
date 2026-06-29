import { Inter, Tajawal } from 'next/font/google';
import localFont from 'next/font/local';
import type { Locale } from '@/i18n/routing';

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

export const rudaw = localFont({
  src: [
    {
      path: '../app/fonts/rudaw-regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../app/fonts/rudaw-bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-kurdish',
  display: 'swap',
});

const localeFontMap = {
  en: inter,
  ar: tajawal,
  ku: rudaw,
} as const satisfies Record<Locale, typeof inter>;

export function getLocaleFont(locale: Locale) {
  return localeFontMap[locale];
}

export const fontVariables = `${inter.variable} ${tajawal.variable} ${rudaw.variable}`;
