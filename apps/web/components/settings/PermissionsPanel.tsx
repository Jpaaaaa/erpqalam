'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/context';
import {
  ApiClientError,
  approveUser,
  listUsers,
  updateUserPermissions,
} from '@/lib/api/users';
import {
  mergePermissionsFromModuleLevels,
  moduleHasViewLevel,
  moduleLevelsFromPermissions,
  PERMISSION_MODULES,
  type ModuleAccessLevel,
} from '@/lib/permission-modules';
import { canManagePermissions } from '@/lib/permissions';
import type { UserRecord } from '@/lib/types/user';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { selectClassName } from '@/components/ui/SelectField';
import { Toast } from '@/components/ui/Toast';
import { UserStatusBadge } from '@/components/users/UserStatusBadge';

type RowState = {
  levels: Record<string, ModuleAccessLevel>;
  dirty: boolean;
  saving: boolean;
  approving: boolean;
};

function buildRowState(user: UserRecord): RowState {
  return {
    levels: moduleLevelsFromPermissions(user.permissions ?? []),
    dirty: false,
    saving: false,
    approving: false,
  };
}

export function PermissionsPanel() {
  const t = useTranslations('permissionsAdmin');
  const tCommon = useTranslations('common');
  const tModules = useTranslations('permissions.modules');
  const tStatus = useTranslations('userStatus');
  const tUsers = useTranslations('users');
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await listUsers({ limit: 100 });
      setUsers(result.data);
      setRows(
        Object.fromEntries(
          result.data.map((user) => [user.id, buildRowState(user)]),
        ),
      );
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const columns = useMemo(() => PERMISSION_MODULES, []);
  const editableUsers = useMemo(
    () => users.filter((user) => user.role !== 'MANAGER'),
    [users],
  );

  if (!currentUser || !canManagePermissions(currentUser.role)) {
    return <Alert variant="error">{t('accessDenied')}</Alert>;
  }

  function setModuleLevel(userId: string, moduleKey: string, level: ModuleAccessLevel) {
    setRows((current) => ({
      ...current,
      [userId]: {
        ...current[userId],
        levels: {
          ...current[userId].levels,
          [moduleKey]: level,
        },
        dirty: true,
      },
    }));
  }

  async function persistPermissions(user: UserRecord): Promise<string[]> {
    const row = rows[user.id];
    if (!row) {
      return user.permissions ?? [];
    }

    const permissions = mergePermissionsFromModuleLevels(row.levels);
    const updated = await updateUserPermissions(user.id, permissions);

    setUsers((current) =>
      current.map((item) =>
        item.id === user.id
          ? { ...item, permissions: updated.permissions }
          : item,
      ),
    );
    setRows((current) => ({
      ...current,
      [user.id]: {
        levels: moduleLevelsFromPermissions(updated.permissions),
        dirty: false,
        saving: false,
        approving: current[user.id]?.approving ?? false,
      },
    }));

    return updated.permissions;
  }

  async function saveRow(user: UserRecord) {
    const row = rows[user.id];
    if (!row || user.role === 'MANAGER') {
      return;
    }

    setRows((current) => ({
      ...current,
      [user.id]: { ...current[user.id], saving: true },
    }));
    setError('');

    try {
      await persistPermissions(user);
      setToastMessage(t('saveSuccess', { name: `${user.firstName} ${user.lastName}` }));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('saveError'));
      setRows((current) => ({
        ...current,
        [user.id]: { ...current[user.id], saving: false },
      }));
    }
  }

  async function approveRow(user: UserRecord) {
    if (user.role === 'MANAGER' || user.status !== 'PENDING') {
      return;
    }

    setRows((current) => ({
      ...current,
      [user.id]: { ...current[user.id], approving: true },
    }));
    setError('');

    try {
      if (rows[user.id]?.dirty) {
        await persistPermissions(user);
      }

      const updated = await approveUser(user.id);
      setUsers((current) =>
        current.map((item) => (item.id === user.id ? updated : item)),
      );
      setRows((current) => ({
        ...current,
        [user.id]: {
          ...current[user.id],
          approving: false,
        },
      }));
      setToastMessage(
        t('approveSuccess', { name: `${user.firstName} ${user.lastName}` }),
      );
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('approveError'));
      setRows((current) => ({
        ...current,
        [user.id]: { ...current[user.id], approving: false },
      }));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('title')} description={t('description')} />

      {error && <Alert variant="error">{error}</Alert>}
      {!loading && editableUsers.length === 0 && users.length > 0 && (
        <Alert variant="info">{t('noEditableUsers')}</Alert>
      )}
      {toastMessage && (
        <Toast message={toastMessage} onDismiss={() => setToastMessage('')} />
      )}

      {loading ? (
        <p className="text-sm text-slate-500">{tCommon('loading')}</p>
      ) : (
        <div className="overflow-x-auto rounded-3xl bg-white shadow-card">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-start font-semibold text-slate-700">
                  {t('userColumn')}
                </th>
                {columns.map((module) => (
                  <th
                    key={module.key}
                    className="px-4 py-3 text-start font-semibold text-slate-700"
                  >
                    {tModules(module.key)}
                  </th>
                ))}
                <th className="px-4 py-3 text-end font-semibold text-slate-700">
                  {t('actionsColumn')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const row = rows[user.id];
                const isManager = user.role === 'MANAGER';
                const isPending = user.status === 'PENDING';

                return (
                  <tr key={user.id} className="align-top">
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-medium text-slate-900">
                          {user.firstName} {user.lastName}
                        </div>
                        {isPending && (
                          <UserStatusBadge
                            status={user.status}
                            label={tStatus(user.status)}
                          />
                        )}
                      </div>
                      <div className="text-slate-500">{user.email}</div>
                    </td>
                    {columns.map((module) => (
                      <td key={module.key} className="px-4 py-4">
                        {isManager ? (
                          <span className="text-slate-500">{t('fullAccess')}</span>
                        ) : (
                          <select
                            className={selectClassName}
                            value={row?.levels[module.key] ?? 'none'}
                            onChange={(event) =>
                              setModuleLevel(
                                user.id,
                                module.key,
                                event.target.value as ModuleAccessLevel,
                              )
                            }
                          >
                            <option value="none">{tCommon('none')}</option>
                            {moduleHasViewLevel(module.key) && (
                              <option value="view">{t('levelView')}</option>
                            )}
                            <option value="manage">{t('levelManage')}</option>
                          </select>
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-4">
                      {isManager ? (
                        <div className="text-end text-slate-400">{tCommon('dash')}</div>
                      ) : (
                        <div className="flex flex-wrap justify-end gap-2">
                          {isPending && (
                            <Button
                              type="button"
                              variant="secondary"
                              disabled={row?.saving || row?.approving}
                              isLoading={row?.approving}
                              loadingLabel={tCommon('pleaseWait')}
                              onClick={() => approveRow(user)}
                            >
                              {tUsers('approve')}
                            </Button>
                          )}
                          <Button
                            type="button"
                            disabled={!row?.dirty || row.saving || row.approving}
                            isLoading={row?.saving}
                            loadingLabel={tCommon('pleaseWait')}
                            onClick={() => saveRow(user)}
                          >
                            {t('saveRow')}
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
