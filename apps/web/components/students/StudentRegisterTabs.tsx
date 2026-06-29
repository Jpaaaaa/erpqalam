'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { TabNav } from '@/components/ui/TabNav';

const tabs = [
  { href: '/dashboard/students/pending', key: 'pendingTab' as const },
  { href: '/dashboard/students/registered', key: 'registeredTab' as const },
];

export function StudentRegisterTabs() {
  const t = useTranslations('students');
  const pathname = usePathname();

  const activeKey =
    tabs.find((tab) => pathname === tab.href)?.key ?? 'pendingTab';

  return (
    <TabNav
      items={tabs.map((tab) => ({
        key: tab.key,
        label: t(tab.key),
        href: tab.href,
      }))}
      activeKey={activeKey}
      aria-label={t('moduleTitle')}
    />
  );
}
