'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth/context';
import { canAccessAttendance } from '@/lib/permissions';
import { PageHeader } from '@/components/ui/PageHeader';
import { TabNav } from '@/components/ui/TabNav';
import { Alert } from '@/components/ui/Alert';

const TAB_BASE = '/dashboard/hr/attendance';

export function AttendancePanel({ children }: { children: React.ReactNode }) {
  const t = useTranslations('attendance');
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user || !canAccessAttendance(user.role, user.permissions)) {
    return <Alert variant="error">{t('accessDenied')}</Alert>;
  }

  const tabs = [
    { key: 'overview', label: t('tabs.overview'), href: `${TAB_BASE}/overview` },
    { key: 'records', label: t('tabs.records'), href: `${TAB_BASE}/records` },
    { key: 'report', label: t('tabs.report'), href: `${TAB_BASE}/report` },
    { key: 'employees', label: t('tabs.employees'), href: `${TAB_BASE}/employees` },
    { key: 'holidays', label: t('tabs.holidays'), href: `${TAB_BASE}/holidays` },
    { key: 'settings', label: t('tabs.settings'), href: `${TAB_BASE}/settings` },
  ];

  const activeKey =
    tabs.find((tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`))
      ?.key ??
    (pathname.includes('/overview')
      ? 'overview'
      : pathname.includes('/records')
        ? 'records'
        : pathname.includes('/report')
          ? 'report'
          : pathname.includes('/employees')
            ? 'employees'
            : pathname.includes('/holidays')
              ? 'holidays'
              : pathname.includes('/settings')
                ? 'settings'
                : 'overview');

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />
      <TabNav items={tabs} activeKey={activeKey} aria-label={t('title')} />
      {children}
    </div>
  );
}
