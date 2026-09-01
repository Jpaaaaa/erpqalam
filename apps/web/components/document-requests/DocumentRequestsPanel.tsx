'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { usePathname } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth/context';
import { canAccessStudentRegistration } from '@/lib/permissions';
import { BackupSettingsForm } from '@/components/document-requests/BackupSettingsForm';
import { DocumentRequestHistoryList } from '@/components/document-requests/DocumentRequestHistoryList';
import { DocumentRequestSettingsForm } from '@/components/document-requests/DocumentRequestSettingsForm';
import { PageHeader } from '@/components/ui/PageHeader';
import { TabNav } from '@/components/ui/TabNav';
import { Alert } from '@/components/ui/Alert';

export function DocumentRequestsPanel() {
  const t = useTranslations('documentRequests');
  const { user } = useAuth();
  const pathname = usePathname();

  if (!user || !canAccessStudentRegistration(user.role, user.permissions)) {
    return <Alert variant="error">{t('accessDenied')}</Alert>;
  }

  const isSettings = pathname.endsWith('/settings');
  const isBackup = pathname.endsWith('/backup');
  const activeKey = isBackup ? 'backup' : isSettings ? 'settings' : 'history';

  const tabs = [
    {
      key: 'history',
      label: t('historyTab'),
      href: '/dashboard/registration/document-requests',
    },
  ];

  if (user.role === 'MANAGER') {
    tabs.push(
      {
        key: 'settings',
        label: t('settingsTab'),
        href: '/dashboard/registration/document-requests/settings',
      },
      {
        key: 'backup',
        label: t('backupTab'),
        href: '/dashboard/registration/document-requests/backup',
      },
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />

      {user.role === 'MANAGER' && (
        <TabNav
          items={tabs.map((tab) => ({
            key: tab.key,
            label: tab.label,
            href: tab.href,
          }))}
          activeKey={activeKey}
          aria-label={t('title')}
        />
      )}

      {isBackup ? (
        user.role === 'MANAGER' ? (
          <BackupSettingsForm />
        ) : (
          <Alert variant="error">{t('managerOnly')}</Alert>
        )
      ) : isSettings ? (
        user.role === 'MANAGER' ? (
          <DocumentRequestSettingsForm />
        ) : (
          <Alert variant="error">{t('managerOnly')}</Alert>
        )
      ) : (
        <>
          {user.role === 'MANAGER' && (
            <p className="text-sm text-slate-600">
              {t('settingsHint')}{' '}
              <Link
                href="/dashboard/registration/document-requests/settings"
                className="font-medium text-teal-700 hover:text-teal-800"
              >
                {t('settingsLink')}
              </Link>
            </p>
          )}
          <DocumentRequestHistoryList />
        </>
      )}
    </div>
  );
}
