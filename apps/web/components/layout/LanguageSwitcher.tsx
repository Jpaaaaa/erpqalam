'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { localeLabels, routing, type Locale } from '@/i18n/routing';

interface LanguageSwitcherProps {
  variant?: 'select' | 'pills';
  compact?: boolean;
}

export function LanguageSwitcher({ variant = 'select', compact = false }: LanguageSwitcherProps) {
  const t = useTranslations('common');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(nextLocale: Locale) {
    if (nextLocale === locale) return;
    router.replace(pathname, { locale: nextLocale });
  }

  if (variant === 'pills') {
    return (
      <div
        className="flex items-center gap-1 rounded-full bg-white/20 p-1 backdrop-blur-sm"
        role="group"
        aria-label={t('language')}
      >
        {routing.locales.map((loc) => {
          const isActive = loc === locale;
          return (
            <button
              key={loc}
              type="button"
              onClick={() => handleChange(loc)}
              className={`rounded-full font-semibold transition ${
                compact ? 'px-2 py-1 text-[10px] sm:px-3 sm:py-1.5 sm:text-xs' : 'px-3 py-1.5 text-xs'
              } ${
                isActive
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-white/90 hover:bg-white/15 hover:text-white'
              }`}
            >
              {localeLabels[loc]}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="language" className="sr-only">
        {t('language')}
      </label>
      <select
        id="language"
        value={locale}
        onChange={(e) => handleChange(e.target.value as Locale)}
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
