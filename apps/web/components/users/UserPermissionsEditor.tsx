'use client';

import { useTranslations } from 'next-intl';
import type { UserPermission } from '@/lib/types/user';
import { ALL_USER_PERMISSIONS } from '@/lib/types/user';
import { canGrantUserManagement } from '@/lib/permissions';
import type { UserRole } from '@/lib/types/user';

interface UserPermissionsEditorProps {
  role: UserRole;
  permissions: UserPermission[];
  actorRole: UserRole;
  onChange: (permissions: UserPermission[]) => void;
}

export function UserPermissionsEditor({
  role,
  permissions,
  actorRole,
  onChange,
}: UserPermissionsEditorProps) {
  const t = useTranslations('users');
  const tPermissions = useTranslations('permissions');
  const grantUserManagement = canGrantUserManagement(actorRole);

  if (role === 'MANAGER') {
    return (
      <p className="text-sm text-slate-500">{t('managerHasAllPermissions')}</p>
    );
  }

  function togglePermission(permission: UserPermission) {
    if (permission === 'USER_MANAGEMENT' && !grantUserManagement) {
      return;
    }

    if (permissions.includes(permission)) {
      onChange(permissions.filter((item) => item !== permission));
      return;
    }

    onChange([...permissions, permission]);
  }

  const visiblePermissions = ALL_USER_PERMISSIONS.filter(
    (permission) => permission !== 'USER_MANAGEMENT' || grantUserManagement,
  );

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-slate-700">
        {t('permissions')}
      </legend>
      <p className="text-sm text-slate-500">{t('permissionsHint')}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {visiblePermissions.map((permission) => (
          <label
            key={permission}
            className="flex cursor-pointer items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm transition hover:border-teal-200 hover:bg-teal-50/30"
          >
            <input
              type="checkbox"
              className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              checked={permissions.includes(permission)}
              onChange={() => togglePermission(permission)}
            />
            <span>
              <span className="font-medium text-slate-900">
                {tPermissions(`${permission}.title`)}
              </span>
              <span className="mt-0.5 block text-slate-500">
                {tPermissions(`${permission}.description`)}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
