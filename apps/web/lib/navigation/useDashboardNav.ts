'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import type { AuthUser } from '@/lib/types/auth';
import {
  canAccessStudentRegistration,
  canAccessUserManagement,
} from '@/lib/permissions';
import {
  HomeIcon,
  StudentsIcon,
  UsersIcon,
  type NavIconComponent,
} from '@/components/layout/NavIcons';

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: NavIconComponent;
  matchPrefix?: string;
};

export function useDashboardNav(user: AuthUser): DashboardNavItem[] {
  const tDashboard = useTranslations('dashboard');

  const items: DashboardNavItem[] = [
    { href: '/dashboard', label: tDashboard('overview'), icon: HomeIcon },
  ];

  if (canAccessUserManagement(user.role, user.permissions)) {
    items.push({
      href: '/dashboard/users',
      label: tDashboard('users'),
      icon: UsersIcon,
    });
  }

  if (canAccessStudentRegistration(user.role, user.permissions)) {
    items.push({
      href: '/dashboard/students/pending',
      label: tDashboard('studentsRegister'),
      icon: StudentsIcon,
      matchPrefix: '/dashboard/students',
    });
  }

  return items;
}

export function isNavItemActive(
  pathname: string,
  item: DashboardNavItem,
): boolean {
  if (item.matchPrefix) {
    return pathname.startsWith(item.matchPrefix);
  }
  return pathname === item.href;
}

export function useDashboardNavWithActive(user: AuthUser) {
  const pathname = usePathname();
  const items = useDashboardNav(user);
  return items.map((item) => ({
    ...item,
    isActive: isNavItemActive(pathname, item),
  }));
}
