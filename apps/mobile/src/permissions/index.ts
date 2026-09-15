/**
 * TECH DEBT: copied from apps/web/lib/permissions.ts (HR-relevant bits only).
 * MANAGER bypass must stay identical to web/api.
 */
import { PERMISSIONS, type Permission } from './constants';

export {
  PERMISSIONS,
  ALL_PERMISSIONS,
  type Permission,
} from './constants';

export type UserRole = 'MANAGER' | 'EMPLOYEE';

export function hasPermission(
  role: UserRole,
  permissions: string[] | undefined,
  required: Permission,
): boolean {
  if (role === 'MANAGER') {
    return true;
  }

  return permissions?.includes(required) ?? false;
}

export function canAccessAttendance(
  role: UserRole,
  permissions: string[] | undefined,
): boolean {
  return hasPermission(role, permissions, PERMISSIONS.ATTENDANCE_VIEW);
}
