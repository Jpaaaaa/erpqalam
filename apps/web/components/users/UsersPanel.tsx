'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/context';
import {
  ApiClientError,
  deactivateUser,
  listUsers,
} from '@/lib/api/users';
import type { UserRecord, UserStatus } from '@/lib/types/user';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { PageHeader } from '@/components/ui/PageHeader';
import { TabNav } from '@/components/ui/TabNav';
import { UserStatusBadge } from '@/components/users/UserStatusBadge';
import { CreateUserForm } from '@/components/users/CreateUserForm';
import { EditUserForm } from '@/components/users/EditUserForm';
import { ApproveUserForm } from '@/components/users/ApproveUserForm';
import type { UserPermission } from '@/lib/types/user';
import { canAccessUserManagement } from '@/lib/permissions';
import { DetailRow, MobileCard } from '@/components/ui/MobileCard';

type StatusFilter = UserStatus | 'ALL';

const filters: StatusFilter[] = ['ALL', 'PENDING', 'ACTIVE', 'INACTIVE'];

function formatDate(value: string, locale: string) {
  return new Date(value).toLocaleString(locale);
}

export function UsersPanel() {
  const locale = useLocale();
  const t = useTranslations('users');
  const tCommon = useTranslations('common');
  const tRoles = useTranslations('roles');
  const tStatus = useTranslations('userStatus');
  const tPermissions = useTranslations('permissions');
  const { user: currentUser } = useAuth();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [approvingUser, setApprovingUser] = useState<UserRecord | null>(null);

  function patchUser(updated: UserRecord) {
    setUsers((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    );
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await listUsers({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        page,
        limit: 20,
      });
      setUsers(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, t]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  if (!currentUser || !canAccessUserManagement(currentUser.role, currentUser.permissions)) {
    return <Alert variant="error">{t('accessDenied')}</Alert>;
  }

  const isManager = currentUser.role === 'MANAGER';

  function handleSaved(updated: UserRecord) {
    setEditingUser(null);
    patchUser(updated);
    setSuccess(t('updateSuccess'));
    load();
  }

  function handleApproved(updated: UserRecord) {
    setApprovingUser(null);
    patchUser(updated);
    setSuccess(t('approveSuccess'));
    load();
  }

  async function handleDeactivate(id: string) {
    if (!window.confirm(t('deactivateConfirm'))) return;

    setActionId(id);
    setError('');
    setSuccess('');
    try {
      await deactivateUser(id);
      setSuccess(t('deactivateSuccess'));
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('deactivateError'));
    } finally {
      setActionId(null);
    }
  }

  function handleCreated() {
    setShowCreate(false);
    setSuccess(t('createSuccess'));
    load();
  }

  function formatPermissions(user: UserRecord) {
    if (user.role === 'MANAGER') {
      return t('allPermissions');
    }

    if (!user.permissions?.length) {
      return t('noPermissions');
    }

    return user.permissions
      .map((permission: UserPermission) => tPermissions(`${permission}.title`))
      .join(', ');
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('description')}
        action={
          !showCreate && !editingUser ? (
            <Button type="button" onClick={() => setShowCreate(true)}>
              {t('addUser')}
            </Button>
          ) : undefined
        }
      />

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {showCreate && (
        <CreateUserForm
          actorRole={currentUser.role}
          onCreated={handleCreated}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {approvingUser && (
        <ApproveUserForm
          user={approvingUser}
          actorRole={currentUser.role}
          onApproved={handleApproved}
          onCancel={() => setApprovingUser(null)}
        />
      )}

      {editingUser && (
        <EditUserForm
          user={editingUser}
          actorRole={currentUser.role}
          onSaved={handleSaved}
          onCancel={() => setEditingUser(null)}
        />
      )}

      <TabNav
        items={filters.map((filter) => ({
          key: filter,
          label: filter === 'ALL' ? t('filterAll') : tStatus(filter),
          onClick: () => setStatusFilter(filter),
        }))}
        activeKey={statusFilter}
      />

      {loading ? (
        <p className="text-sm text-slate-500">{tCommon('loading')}</p>
      ) : users.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          {t('noUsers')}
        </p>
      ) : (
        <>
          <p className="text-xs font-medium text-slate-400">
            {t('totalCount', { count: total })}
          </p>

          <div className="space-y-3 md:hidden">
            {users.map((user) => {
              const isSelf = user.id === currentUser?.id;
              const canEditUser = isManager || user.role !== 'MANAGER';
              const canDeactivateUser =
                user.status === 'ACTIVE' && !isSelf && canEditUser;

              return (
                <MobileCard key={user.id}>
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          {user.firstName} {user.lastName}
                          {isSelf && (
                            <span className="ms-1 text-xs font-normal text-slate-400">
                              ({t('you')})
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-sm text-slate-500">{user.email}</p>
                      </div>
                      <UserStatusBadge
                        status={user.status}
                        label={tStatus(user.status)}
                      />
                    </div>
                    <div className="grid gap-3">
                      <DetailRow label={t('role')}>{tRoles(user.role)}</DetailRow>
                      <DetailRow label={t('permissions')}>
                        {formatPermissions(user)}
                      </DetailRow>
                      <DetailRow label={t('joined')}>
                        {formatDate(user.createdAt, locale)}
                      </DetailRow>
                    </div>
                    <div className="flex flex-col gap-2">
                      {user.status === 'PENDING' && (
                        <Button
                          type="button"
                          variant="secondary"
                          className="w-full"
                          onClick={() => {
                            setShowCreate(false);
                            setEditingUser(null);
                            setApprovingUser(user);
                          }}
                        >
                          {t('approve')}
                        </Button>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          disabled={!canEditUser}
                          onClick={() => {
                            if (!canEditUser) return;
                            setShowCreate(false);
                            setApprovingUser(null);
                            setEditingUser(user);
                          }}
                        >
                          {t('edit')}
                        </Button>
                        {canDeactivateUser && (
                          <Button
                            type="button"
                            variant="danger"
                            isLoading={actionId === user.id}
                            loadingLabel={tCommon('pleaseWait')}
                            onClick={() => handleDeactivate(user.id)}
                          >
                            {t('deactivate')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </MobileCard>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl bg-slate-50/50 shadow-sm md:block">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('name')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('email')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('role')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('permissions')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('status')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('joined')}
                  </th>
                  <th className="px-4 py-3 text-end text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {users.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  const canEditUser = isManager || user.role !== 'MANAGER';
                  const canDeactivateUser =
                    user.status === 'ACTIVE' && !isSelf && canEditUser;
                  return (
                    <tr key={user.id} className="transition hover:bg-slate-50/80">
                      <td className="px-4 py-3.5 font-medium text-slate-900">
                        {user.firstName} {user.lastName}
                        {isSelf && (
                          <span className="ms-2 text-xs font-normal text-slate-400">
                            ({t('you')})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{user.email}</td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {tRoles(user.role)}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {formatPermissions(user)}
                      </td>
                      <td className="px-4 py-3.5">
                        <UserStatusBadge
                          status={user.status}
                          label={tStatus(user.status)}
                        />
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">
                        {formatDate(user.createdAt, locale)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap justify-end gap-2">
                          {user.status === 'PENDING' && (
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => {
                                setShowCreate(false);
                                setEditingUser(null);
                                setApprovingUser(user);
                              }}
                            >
                              {t('approve')}
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            disabled={!canEditUser}
                            onClick={() => {
                              if (!canEditUser) return;
                              setShowCreate(false);
                              setApprovingUser(null);
                              setEditingUser(user);
                            }}
                          >
                            {t('edit')}
                          </Button>
                          {canDeactivateUser && (
                            <Button
                              type="button"
                              variant="danger"
                              isLoading={actionId === user.id}
                              loadingLabel={tCommon('pleaseWait')}
                              onClick={() => handleDeactivate(user.id)}
                            >
                              {t('deactivate')}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                {t('prevPage')}
              </Button>
              <span className="text-center text-sm text-slate-500">
                {t('pageOf', { page, totalPages })}
              </span>
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t('nextPage')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
