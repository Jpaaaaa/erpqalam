import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { AppLogoIcon } from '@/components/layout/NavIcons';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('common');

  return (
    <div className="relative flex min-h-dvh items-center justify-center px-3 py-8 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-12">
      <div className="absolute end-3 top-[max(0.75rem,env(safe-area-inset-top))] sm:end-4 sm:top-4">
        <LanguageSwitcher variant="pills" compact />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient shadow-soft">
            <AppLogoIcon className="h-8 w-8" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-600">
            {t('appName')}
          </p>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {t('appSubtitle')}
          </h1>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-card sm:rounded-3xl sm:p-8">{children}</div>
      </div>
    </div>
  );
}
