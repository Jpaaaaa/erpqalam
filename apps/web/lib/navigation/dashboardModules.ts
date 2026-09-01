import type { NavIconComponent } from '@/components/layout/NavIcons';
import { HrIcon, StudentsIcon } from '@/components/layout/NavIcons';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import type { Permission } from '@/lib/permissions/constants';
import type { AuthUser } from '@/lib/types/auth';

export type DashboardModule = {
  key: string;
  labelKey: `modules.${string}`;
  icon: NavIconComponent;
  href: string;
  requiredPermission: Permission;
};

export const DASHBOARD_MODULES: DashboardModule[] = [
  {
    key: 'registration',
    labelKey: 'modules.registration',
    icon: StudentsIcon,
    href: '/dashboard/registration/students/pending',
    requiredPermission: PERMISSIONS.REGISTRATION_VIEW,
  },
  {
    key: 'hr',
    labelKey: 'modules.hr',
    icon: HrIcon,
    href: '/dashboard/hr/attendance/overview',
    requiredPermission: PERMISSIONS.ATTENDANCE_VIEW,
  },
];

export function canAccessModule(
  user: AuthUser,
  module: DashboardModule,
): boolean {
  return hasPermission(user.role, user.permissions, module.requiredPermission);
}

export function getAccessibleModules(user: AuthUser): DashboardModule[] {
  return DASHBOARD_MODULES.filter((module) => canAccessModule(user, module));
}

export type DashboardNavContext = 'launcher' | 'registration' | 'hr' | 'settings';

export function getDashboardNavContext(pathname: string): DashboardNavContext {
  if (pathname.startsWith('/dashboard/registration')) {
    return 'registration';
  }
  if (pathname.startsWith('/dashboard/hr')) {
    return 'hr';
  }
  if (pathname.startsWith('/dashboard/settings')) {
    return 'settings';
  }
  return 'launcher';
}
