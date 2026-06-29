'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { localeLabels, routing, type Locale } from '@/i18n/routing';

export function LanguageSwitcher() {
  const t = useTranslations('common');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(nextLocale: string) {
    if (nextLocale === locale || !routing.locales.includes(nextLocale as Locale)) {
      return;
    }
    router.replace(pathname, { locale: nextLocale as Locale });
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language" className="sr-only">
        {t('language')}
      </label>
      <select
        id="language"
        value={locale}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeLabels[loc]}
          </option>
        ))}
        <option disabled value="tr">
          {localeLabels.tr} ({t('comingSoon')})
        </option>
      </select>
    </div>
  );
}
