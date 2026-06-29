import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('common');

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="absolute end-4 top-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-indigo-600">
            {t('appName')}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{t('appSubtitle')}</h1>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
