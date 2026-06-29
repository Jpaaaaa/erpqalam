'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

const tabs = [
  { href: '/dashboard/students/pending', key: 'pendingTab' as const },
  { href: '/dashboard/students/registered', key: 'registeredTab' as const },
];

export function StudentRegisterTabs() {
  const t = useTranslations('students');
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 border-b border-slate-200"
      aria-label={t('moduleTitle')}
    >
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            {t(tab.key)}
          </Link>
        );
      })}
    </nav>
  );
}
