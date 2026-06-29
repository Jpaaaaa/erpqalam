import { UserPermission, UserRole } from '@generated/prisma/client';

export { UserPermission };

export const ALL_USER_PERMISSIONS: UserPermission[] = [
  UserPermission.USER_MANAGEMENT,
  UserPermission.STUDENT_REGISTRATION,
];

export function hasPermission(
  role: UserRole,
  permissions: UserPermission[] | undefined,
  required: UserPermission,
): boolean {
  if (role === UserRole.MANAGER) {
    return true;
  }

  return permissions?.includes(required) ?? false;
}

export function hasAnyPermission(
  role: UserRole,
  permissions: UserPermission[] | undefined,
  required: UserPermission[],
): boolean {
  if (role === UserRole.MANAGER) {
    return true;
  }

  if (!required.length) {
    return true;
  }

  return required.some((permission) => permissions?.includes(permission));
}
