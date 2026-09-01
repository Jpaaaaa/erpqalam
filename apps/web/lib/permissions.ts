import type { UserRole } from '@/lib/types/user';
import { PERMISSIONS, type Permission } from '@/lib/permissions/constants';

export { PERMISSIONS, ALL_PERMISSIONS, type Permission } from '@/lib/permissions/constants';

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

export function canAccessRegistration(
  role: UserRole,
  permissions: string[] | undefined,
): boolean {
  return hasPermission(role, permissions, PERMISSIONS.REGISTRATION_VIEW);
}

export function canAccessDocuments(
  role: UserRole,
  permissions: string[] | undefined,
): boolean {
  return hasPermission(role, permissions, PERMISSIONS.DOCUMENTS_VIEW);
}

export function canAccessUserManagement(
  role: UserRole,
  permissions: string[] | undefined,
): boolean {
  return hasPermission(role, permissions, PERMISSIONS.USERS_MANAGE);
}

export function canAccessAttendance(
  role: UserRole,
  permissions: string[] | undefined,
): boolean {
  return hasPermission(role, permissions, PERMISSIONS.ATTENDANCE_VIEW);
}

export function canManagePermissions(role: UserRole): boolean {
  return role === 'MANAGER';
}

export const canGrantUserManagement = canManagePermissions;
