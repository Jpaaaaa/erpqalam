import type { NavIconComponent } from '@/components/layout/NavIcons';
import { HrIcon, StudentsIcon } from '@/components/layout/NavIcons';
import { hasPermission } from '@/lib/permissions';
import type { AuthUser } from '@/lib/types/auth';
import type { UserPermission, UserRole } from '@/lib/types/user';

export type DashboardModule = {
  key: string;
  labelKey: `modules.${string}`;
  icon: NavIconComponent;
  href: string;
  allowedRoles: UserRole[];
  permission?: UserPermission;
};

export const DASHBOARD_MODULES: DashboardModule[] = [
  {
    key: 'registration',
    labelKey: 'modules.registration',
    icon: StudentsIcon,
    href: '/dashboard/registration/students/pending',
    allowedRoles: ['MANAGER', 'EMPLOYEE'],
    permission: 'STUDENT_REGISTRATION',
  },
  {
    key: 'hr',
    labelKey: 'modules.hr',
    icon: HrIcon,
    href: '/dashboard/hr',
    allowedRoles: ['MANAGER'],
  },
];

export function canAccessModule(
  user: AuthUser,
  module: DashboardModule,
): boolean {
  if (!module.allowedRoles.includes(user.role)) {
    return false;
  }

  if (module.permission) {
    return hasPermission(user.role, user.permissions, module.permission);
  }

  return true;
}

export function getAccessibleModules(user: AuthUser): DashboardModule[] {
  return DASHBOARD_MODULES.filter((module) => canAccessModule(user, module));
}

export type DashboardNavContext = 'launcher' | 'registration' | 'hr';

export function getDashboardNavContext(pathname: string): DashboardNavContext {
  if (pathname.startsWith('/dashboard/registration')) {
    return 'registration';
  }
  if (pathname.startsWith('/dashboard/hr')) {
    return 'hr';
  }
  return 'launcher';
}
