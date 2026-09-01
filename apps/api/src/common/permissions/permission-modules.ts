import { Permission, sanitizePermissions } from './permissions';

export type ModuleAccessLevel = 'none' | 'view' | 'manage';

export type PermissionModule = {
  key: string;
  levels: {
    none: Permission[];
    view?: Permission[];
    manage: Permission[];
  };
};

export const PERMISSION_MODULES: PermissionModule[] = [
  {
    key: 'registration',
    levels: {
      none: [],
      view: ['registration.view'],
      manage: ['registration.view', 'registration.manage', 'registration.approve'],
    },
  },
  {
    key: 'attendance',
    levels: {
      none: [],
      view: ['attendance.view'],
      manage: ['attendance.view', 'attendance.manage'],
    },
  },
  {
    key: 'documents',
    levels: {
      none: [],
      view: ['documents.view'],
      manage: ['documents.view', 'documents.manage'],
    },
  },
  {
    key: 'users',
    levels: {
      none: [],
      manage: ['users.manage'],
    },
  },
];

const MODULE_PERMISSIONS = new Map(
  PERMISSION_MODULES.map((module) => [
    module.key,
    new Set([
      ...(module.levels.view ?? []),
      ...module.levels.manage,
    ]),
  ]),
);

export function permissionsForModuleLevel(
  moduleKey: string,
  level: ModuleAccessLevel,
): Permission[] {
  const module = PERMISSION_MODULES.find((item) => item.key === moduleKey);
  if (!module) {
    return [];
  }

  if (level === 'view') {
    return module.levels.view ?? [];
  }

  if (level === 'manage') {
    return module.levels.manage;
  }

  return module.levels.none;
}

export function moduleLevelFromPermissions(
  moduleKey: string,
  permissions: string[],
): ModuleAccessLevel {
  const module = PERMISSION_MODULES.find((item) => item.key === moduleKey);
  if (!module) {
    return 'none';
  }

  const granted = new Set(permissions);
  const hasManage = module.levels.manage.every((permission) =>
    granted.has(permission),
  );
  if (hasManage) {
    return 'manage';
  }

  const viewPermissions = module.levels.view ?? [];
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

  for (const module of PERMISSION_MODULES) {
    const level = levels[module.key] ?? 'none';
    for (const permission of permissionsForModuleLevel(module.key, level)) {
      merged.add(permission);
    }
  }

  return [...merged];
}

export function replaceModulePermissions(
  current: string[],
  moduleKey: string,
  level: ModuleAccessLevel,
): Permission[] {
  const modulePermissions = MODULE_PERMISSIONS.get(moduleKey);
  const kept = sanitizePermissions(current).filter(
    (permission) => !modulePermissions?.has(permission),
  );

  return [...kept, ...permissionsForModuleLevel(moduleKey, level)];
}
