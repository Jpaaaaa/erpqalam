import type { UserPermission, UserRole } from '@/lib/types/user';

export function hasPermission(
  role: UserRole,
  permissions: UserPermission[] | undefined,
  required: UserPermission,
): boolean {
  if (role === 'MANAGER') {
    return true;
  }

  return permissions?.includes(required) ?? false;
}

export function canAccessUserManagement(
  role: UserRole,
  permissions: UserPermission[] | undefined,
): boolean {
  return hasPermission(role, permissions, 'USER_MANAGEMENT');
}

export function canAccessStudentRegistration(
  role: UserRole,
  permissions: UserPermission[] | undefined,
): boolean {
  return hasPermission(role, permissions, 'STUDENT_REGISTRATION');
}

export function canGrantUserManagement(role: UserRole): boolean {
  return role === 'MANAGER';
}
