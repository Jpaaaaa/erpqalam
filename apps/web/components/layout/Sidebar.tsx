'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { AuthUser } from '@/lib/types/auth';
import { useDashboardNavWithActive } from '@/lib/navigation/useDashboardNav';
import { AppLogoIcon } from '@/components/layout/NavIcons';
import webPackage from '@/package.json';

interface SidebarProps {
  user: AuthUser;
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function Sidebar({ user }: SidebarProps) {
  const t = useTranslations('common');
  const tRoles = useTranslations('roles');
  const items = useDashboardNavWithActive(user);

  return (
    <aside className="hidden w-[4.75rem] shrink-0 flex-col items-center rounded-3xl bg-white py-5 shadow-card md:flex">
      <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient shadow-sm">
        <AppLogoIcon className="h-6 w-6" />
      </div>

      <nav className="flex flex-1 flex-col items-center gap-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              className={`flex h-11 w-11 items-center justify-center rounded-2xl transition ${
                item.isActive
                  ? 'bg-orange-100 text-orange-500 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 flex flex-col items-center gap-2 border-t border-slate-100 pt-4">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-orange-300 text-xs font-bold text-white shadow-sm"
          title={`${user.firstName} ${user.lastName}`}
        >
          {getInitials(user.firstName, user.lastName)}
        </div>
        <span className="max-w-[4rem] truncate text-center text-[10px] font-medium text-slate-500">
          {tRoles(user.role)}
        </span>
        <span className="text-[9px] font-medium text-slate-400">
          v{webPackage.version}
        </span>
        <span className="sr-only">{t('appName')}</span>
      </div>
    </aside>
  );
}
