import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { Viewport } from 'next';
import { AuthProvider } from '@/lib/auth/context';
import { fontVariables, getLocaleFont } from '@/lib/fonts';
import { routing, rtlLocales, type Locale } from '@/i18n/routing';
import '../globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#2ec4b6',
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const typedLocale = locale as Locale;
  const isRtl = rtlLocales.includes(typedLocale);
  const localeFont = getLocaleFont(typedLocale);

  return (
    <html lang={locale} dir={isRtl ? 'rtl' : 'ltr'} className={fontVariables}>
      <body className={`${localeFont.className} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>{children}</AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
