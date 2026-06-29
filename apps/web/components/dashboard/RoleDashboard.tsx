'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/context';
import { listPendingStudents, listStudents } from '@/lib/api/students';
import { listUsers } from '@/lib/api/users';
import { PageCard } from '@/components/ui/PageCard';
import { PageHeader } from '@/components/ui/PageHeader';
import { MetricCard } from '@/components/ui/MetricCard';

function UsersIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function StudentsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}

function useManagerStats() {
  const [stats, setStats] = useState({
    pendingUsers: 0,
    activeUsers: 0,
    pendingStudents: 0,
    registeredStudents: 0,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [pendingUsers, activeUsers, pendingStudents, registeredStudents] =
          await Promise.all([
            listUsers({ status: 'PENDING', limit: 1 }),
            listUsers({ status: 'ACTIVE', limit: 1 }),
            listPendingStudents({ limit: 1 }),
            listStudents({ limit: 1 }),
          ]);

        if (!cancelled) {
          setStats({
            pendingUsers: pendingUsers.total,
            activeUsers: activeUsers.total,
            pendingStudents: pendingStudents.total,
            registeredStudents: registeredStudents.total,
            loading: false,
          });
        }
      } catch {
        if (!cancelled) {
          setStats((current) => ({ ...current, loading: false }));
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
}

export function ManagerDashboard() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const stats = useManagerStats();

  const display = (value: number) => (stats.loading ? tCommon('loading') : value);

  const totalStudents = stats.pendingStudents + stats.registeredStudents;
  const registeredPct =
    totalStudents > 0
      ? Math.round((stats.registeredStudents / totalStudents) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <PageCard>
        <PageHeader
          eyebrow={t('overview')}
          title={t('managerOverview')}
          description={t('managerDescription')}
          className="mb-0"
        />
      </PageCard>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={t('pendingApprovals')}
          value={display(stats.pendingUsers)}
          tone="amber"
          icon={<ClockIcon />}
          footer={stats.pendingUsers > 0 ? t('needsReview') : undefined}
        />
        <MetricCard
          label={t('activeEmployees')}
          value={display(stats.activeUsers)}
          tone="teal"
          icon={<UsersIcon />}
        />
        <MetricCard
          label={t('pendingStudents')}
          value={display(stats.pendingStudents)}
          tone="orange"
          icon={<StudentsIcon />}
        />
        <MetricCard
          label={t('registeredStudents')}
          value={display(stats.registeredStudents)}
          tone="coral"
          icon={<CheckIcon />}
          progress={registeredPct}
          footer={totalStudents > 0 ? `${registeredPct}% ${t('enrolled')}` : undefined}
        />
      </div>
    </div>
  );
}

export function EmployeeDashboard() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');

  const stats = [
    { label: t('todaySchedule'), value: tCommon('comingSoon'), tone: 'teal' as const },
    { label: t('notifications'), value: tCommon('none'), tone: 'orange' as const },
  ];

  return (
    <div className="space-y-6">
      <PageCard>
        <PageHeader
          eyebrow={t('overview')}
          title={t('employeeOverview')}
          description={t('employeeDescription')}
          className="mb-0"
        />
      </PageCard>

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <MetricCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            tone={stat.tone}
          />
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
