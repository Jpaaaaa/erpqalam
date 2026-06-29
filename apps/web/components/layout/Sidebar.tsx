'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import type { AuthUser } from '@/lib/types/auth';

interface SidebarProps {
  user: AuthUser;
}

type NavLink = {
  href: string;
  label: string;
  matchPrefix?: string;
};

export function Sidebar({ user }: SidebarProps) {
  const t = useTranslations('common');
  const tDashboard = useTranslations('dashboard');
  const tRoles = useTranslations('roles');
  const pathname = usePathname();

  const managerLinks: NavLink[] = [
    { href: '/dashboard', label: tDashboard('overview') },
    { href: '/dashboard/users', label: tDashboard('users') },
    {
      href: '/dashboard/students/pending',
      label: tDashboard('studentsRegister'),
      matchPrefix: '/dashboard/students',
    },
  ];

  const employeeLinks: NavLink[] = [
    { href: '/dashboard', label: tDashboard('overview') },
  ];

  const links = user.role === 'MANAGER' ? managerLinks : employeeLinks;

  return (
    <aside className="flex w-64 flex-col border-e border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <p className="text-lg font-semibold text-slate-900">{t('appName')}</p>
        <p className="text-xs text-slate-500">{t('schoolManagement')}</p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {links.map((link) => {
          const isActive = link.matchPrefix
            ? pathname.startsWith(link.matchPrefix)
            : pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <p className="truncate text-sm font-medium text-slate-900">
          {user.firstName} {user.lastName}
        </p>
        <p className="truncate text-xs text-slate-500">{user.email}</p>
        <span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
          {tRoles(user.role)}
        </span>
      </div>
    </aside>
  );
}
