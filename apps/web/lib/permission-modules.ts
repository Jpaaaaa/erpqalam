import type { Permission } from '@/lib/permissions/constants';

export type ModuleAccessLevel = 'none' | 'view' | 'manage';

export type PermissionModule = {
  key: string;
  labelKey: `permissions.modules.${string}`;
  levels: {
    none: Permission[];
    view?: Permission[];
    manage: Permission[];
  };
};

export const PERMISSION_MODULES: PermissionModule[] = [
  {
    key: 'registration',
    labelKey: 'permissions.modules.registration',
    levels: {
      none: [],
      view: ['registration.view'],
      manage: ['registration.view', 'registration.manage', 'registration.approve'],
    },
  },
  {
    key: 'attendance',
    labelKey: 'permissions.modules.attendance',
    levels: {
      none: [],
      view: ['attendance.view'],
      manage: ['attendance.view', 'attendance.manage'],
    },
  },
  {
    key: 'documents',
    labelKey: 'permissions.modules.documents',
    levels: {
      none: [],
      view: ['documents.view'],
      manage: ['documents.view', 'documents.manage'],
    },
  },
  {
    key: 'users',
    labelKey: 'permissions.modules.users',
    levels: {
      none: [],
      manage: ['users.manage'],
    },
  },
];

const MODULE_PERMISSIONS = new Map(
  PERMISSION_MODULES.map((entry) => [
    entry.key,
    new Set([
      ...(entry.levels.view ?? []),
      ...entry.levels.manage,
    ]),
  ]),
);

export function permissionsForModuleLevel(
  moduleKey: string,
  level: ModuleAccessLevel,
): Permission[] {
  const permissionModule = PERMISSION_MODULES.find((item) => item.key === moduleKey);
  if (!permissionModule) {
    return [];
  }

  if (level === 'view') {
    return permissionModule.levels.view ?? [];
  }

  if (level === 'manage') {
    return permissionModule.levels.manage;
  }

  return permissionModule.levels.none;
}

export function moduleLevelFromPermissions(
  moduleKey: string,
  permissions: string[],
): ModuleAccessLevel {
  const permissionModule = PERMISSION_MODULES.find((item) => item.key === moduleKey);
  if (!permissionModule) {
    return 'none';
  }

  const granted = new Set(permissions);
  const hasManage = permissionModule.levels.manage.every((permission) =>
    granted.has(permission),
  );
  if (hasManage) {
    return 'manage';
  }

  const viewPermissions = permissionModule.levels.view ?? [];
  if (
    viewPermissions.length > 0 &&
    viewPermissions.every((permission) => granted.has(permission))
  ) {
    return 'view';
  }

  return 'none';
}

export function mergePermissionsFromModuleLevels(
  levels: Record<string, ModuleAccessLevel>,
): Permission[] {
  const merged = new Set<Permission>();

  for (const entry of PERMISSION_MODULES) {
    const level = levels[entry.key] ?? 'none';
    for (const permission of permissionsForModuleLevel(entry.key, level)) {
      merged.add(permission);
    }
  }

  return Array.from(merged);
}

export function moduleLevelsFromPermissions(
  permissions: string[],
): Record<string, ModuleAccessLevel> {
  return Object.fromEntries(
    PERMISSION_MODULES.map((entry) => [
      entry.key,
      moduleLevelFromPermissions(entry.key, permissions),
    ]),
  );
}

export function replaceModulePermissions(
  current: string[],
  moduleKey: string,
  level: ModuleAccessLevel,
): Permission[] {
  const modulePermissions = MODULE_PERMISSIONS.get(moduleKey);
  const kept = current.filter(
    (permission) => !modulePermissions?.has(permission as Permission),
  ) as Permission[];

  return [...kept, ...permissionsForModuleLevel(moduleKey, level)];
}

export function moduleHasViewLevel(moduleKey: string): boolean {
  const permissionModule = PERMISSION_MODULES.find((item) => item.key === moduleKey);
  return Boolean(permissionModule?.levels.view?.length);
}
