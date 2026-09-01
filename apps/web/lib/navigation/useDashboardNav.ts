'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import type { AuthUser } from '@/lib/types/auth';
import {
  canAccessStudentRegistration,
  canAccessUserManagement,
} from '@/lib/permissions';
import {
  getDashboardNavContext,
} from '@/lib/navigation/dashboardModules';
import {
  DocumentIcon,
  HomeIcon,
  HrIcon,
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

    if (canAccessStudentRegistration(user.role, user.permissions)) {
      items.push(
        {
          href: '/dashboard/registration/students/pending',
          label: tDashboard('studentsRegister'),
          icon: StudentsIcon,
          matchPrefix: '/dashboard/registration/students',
        },
        {
          href: '/dashboard/registration/document-requests',
          label: tDashboard('documentRequests'),
          icon: DocumentIcon,
          matchPrefix: '/dashboard/registration/document-requests',
        },
      );
    }

    return items;
  }

  if (context === 'hr') {
    const items: DashboardNavItem[] = [
      home,
      {
        href: '/dashboard/hr',
        label: tDashboard('modules.hr'),
        icon: HrIcon,
        matchPrefix: '/dashboard/hr',
      },
    ];

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

  return [home];
}

export function isNavItemActive(
  pathname: string,
  item: DashboardNavItem,
): boolean {
  if (item.matchPrefix) {
    if (item.href === '/dashboard/hr') {
      return (
        pathname.startsWith('/dashboard/hr') &&
        !pathname.startsWith('/dashboard/hr/users')
      );
    }
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
