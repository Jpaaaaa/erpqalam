import { UserRole } from '@generated/prisma/client';

export const PERMISSIONS = {
  REGISTRATION_VIEW: 'registration.view',
  REGISTRATION_MANAGE: 'registration.manage',
  REGISTRATION_APPROVE: 'registration.approve',
  ATTENDANCE_VIEW: 'attendance.view',
  ATTENDANCE_MANAGE: 'attendance.manage',
  DOCUMENTS_VIEW: 'documents.view',
  DOCUMENTS_MANAGE: 'documents.manage',
  USERS_MANAGE: 'users.manage',
  SETTINGS_MANAGE: 'settings.manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);

export function isPermission(value: string): value is Permission {
  return ALL_PERMISSIONS.includes(value as Permission);
}

export function hasPermission(
  role: UserRole,
  permissions: string[] | undefined,
  required: Permission,
): boolean {
  if (role === UserRole.MANAGER) {
    return true;
  }

  return permissions?.includes(required) ?? false;
}

export function hasAnyPermission(
  role: UserRole,
  permissions: string[] | undefined,
  required: Permission[],
): boolean {
  if (role === UserRole.MANAGER) {
    return true;
  }

  if (!required.length) {
    return true;
  }

  return required.some((permission) => permissions?.includes(permission));
}

export function resolvePermissions(
  role: UserRole,
  permissions?: string[] | null,
): string[] {
  if (role === UserRole.MANAGER) {
    return [];
  }

  return permissions ?? [];
}

export function sanitizePermissions(permissions: string[]): Permission[] {
  return permissions.filter(isPermission);
}
