'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import type { AuthUser } from '@/lib/types/auth';
import {
  canAccessAttendance,
  canAccessDocuments,
  canAccessRegistration,
  canAccessUserManagement,
  canManagePermissions,
} from '@/lib/permissions';
import { getDashboardNavContext } from '@/lib/navigation/dashboardModules';
import {
  AttendanceIcon,
  DocumentIcon,
  HomeIcon,
  SettingsIcon,
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
  const pathname = usePathname();
  const context = getDashboardNavContext(pathname);

  const home: DashboardNavItem = {
    href: '/dashboard',
    label: tDashboard('overview'),
    icon: HomeIcon,
  };

  if (context === 'registration') {
    const items: DashboardNavItem[] = [home];

    if (canAccessRegistration(user.role, user.permissions)) {
      items.push({
        href: '/dashboard/registration/students/pending',
        label: tDashboard('studentsRegister'),
        icon: StudentsIcon,
        matchPrefix: '/dashboard/registration/students',
      });
    }

    if (canAccessDocuments(user.role, user.permissions)) {
      items.push({
        href: '/dashboard/registration/document-requests',
        label: tDashboard('documentRequests'),
        icon: DocumentIcon,
        matchPrefix: '/dashboard/registration/document-requests',
      });
    }

    return items;
  }

  if (context === 'hr') {
    const items: DashboardNavItem[] = [home];

    if (canAccessAttendance(user.role, user.permissions)) {
      items.push({
        href: '/dashboard/hr/attendance/overview',
        label: tDashboard('attendance'),
        icon: AttendanceIcon,
        matchPrefix: '/dashboard/hr/attendance',
      });
    }

    if (canAccessUserManagement(user.role, user.permissions)) {
      items.push({
        href: '/dashboard/hr/users',
        label: tDashboard('users'),
        icon: UsersIcon,
        matchPrefix: '/dashboard/hr/users',
      });
    }

    return items;
  }

  if (context === 'settings') {
    const items: DashboardNavItem[] = [home];

    if (canManagePermissions(user.role)) {
      items.push({
        href: '/dashboard/settings/permissions',
        label: tDashboard('permissionsSettings'),
        icon: SettingsIcon,
        matchPrefix: '/dashboard/settings/permissions',
      });
    }

    return items;
  }

  const items: DashboardNavItem[] = [home];

  if (canManagePermissions(user.role)) {
    items.push({
      href: '/dashboard/settings/permissions',
      label: tDashboard('permissionsSettings'),
      icon: SettingsIcon,
      matchPrefix: '/dashboard/settings',
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
