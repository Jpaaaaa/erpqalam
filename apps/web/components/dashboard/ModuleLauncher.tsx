'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth/context';
import { getAccessibleModules } from '@/lib/navigation/dashboardModules';
import { PageCard } from '@/components/ui/PageCard';
import { PageHeader } from '@/components/ui/PageHeader';

export function ModuleLauncher() {
  const t = useTranslations('dashboard');
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const modules = getAccessibleModules(user);

  return (
    <div className="space-y-6">
      <PageCard>
        <PageHeader
          eyebrow={t('overview')}
          title={t('modulesTitle')}
          description={t('modulesDescription')}
          className="mb-0"
        />
      </PageCard>

      {modules.length === 0 ? (
        <PageCard>
          <p className="text-sm text-slate-600">{t('noModules')}</p>
        </PageCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon;
            const label = t(module.labelKey);

            return (
              <Link
                key={module.key}
                href={module.href}
                className="group rounded-3xl bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-500 transition group-hover:bg-orange-200">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">{label}</h2>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
