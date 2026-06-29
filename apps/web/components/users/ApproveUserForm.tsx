'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiClientError, approveUser } from '@/lib/api/users';
import type { UserRecord, UserPermission, UserRole } from '@/lib/types/user';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { FormPanel } from '@/components/ui/FormPanel';
import { UserPermissionsEditor } from '@/components/users/UserPermissionsEditor';

interface ApproveUserFormProps {
  user: UserRecord;
  actorRole: UserRole;
  onApproved: (user: UserRecord) => void;
  onCancel: () => void;
}

export function ApproveUserForm({
  user,
  actorRole,
  onApproved,
  onCancel,
}: ApproveUserFormProps) {
  const t = useTranslations('users');
  const tCommon = useTranslations('common');
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const updated = await approveUser(user.id, permissions);
      onApproved(updated);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('approveError'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <FormPanel
      title={`${t('approveUser')}: ${user.firstName} ${user.lastName}`}
      tone="warning"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-slate-600">{t('approvePermissionsHint')}</p>
        {error && <Alert variant="error">{error}</Alert>}

        <UserPermissionsEditor
          role="EMPLOYEE"
          permissions={permissions}
          actorRole={actorRole}
          onChange={setPermissions}
        />

        <div className="flex flex-wrap gap-2">
          <Button type="submit" isLoading={isLoading} loadingLabel={tCommon('pleaseWait')}>
            {t('approve')}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t('cancel')}
          </Button>
        </div>
      </form>
    </FormPanel>
  );
}
