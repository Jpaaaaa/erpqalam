'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/context';

export function ManagerDashboard() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');

  const stats = [
    { label: t('pendingApprovals'), value: tCommon('dash') },
    { label: t('activeEmployees'), value: tCommon('dash') },
    { label: t('schoolModules'), value: tCommon('oneActive') },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">{t('managerOverview')}</h2>
        <p className="mt-2 text-sm text-slate-600">{t('managerDescription')}</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmployeeDashboard() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');

  const stats = [
    { label: t('todaySchedule'), value: tCommon('comingSoon') },
    { label: t('notifications'), value: tCommon('none') },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">{t('employeeOverview')}</h2>
        <p className="mt-2 text-sm text-slate-600">{t('employeeDescription')}</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-1 text-lg font-medium text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RoleDashboard() {
  const { user } = useAuth();

  if (!user) return null;

  return user.role === 'MANAGER' ? <ManagerDashboard /> : <EmployeeDashboard />;
}
