'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiClientError, updateUser } from '@/lib/api/users';
import type { UserRecord, UserRole, UserStatus, UserPermission } from '@/lib/types/user';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { FormPanel } from '@/components/ui/FormPanel';
import { SelectField } from '@/components/ui/SelectField';
import { UserPermissionsEditor } from '@/components/users/UserPermissionsEditor';
import { canGrantUserManagement } from '@/lib/permissions';

interface EditUserFormProps {
  user: UserRecord;
  actorRole: UserRole;
  onSaved: (user: UserRecord) => void;
  onCancel: () => void;
}

export function EditUserForm({ user, actorRole, onSaved, onCancel }: EditUserFormProps) {
  const t = useTranslations('users');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const tRoles = useTranslations('roles');
  const tStatus = useTranslations('userStatus');
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone ?? '');
  const [role, setRole] = useState<UserRole>(user.role);
  const [permissions, setPermissions] = useState<UserPermission[]>(user.permissions ?? []);
  const [status, setStatus] = useState<UserStatus>(user.status);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const canEditManagerFields = canGrantUserManagement(actorRole);
  const isTargetManager = user.role === 'MANAGER';

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const updated = await updateUser(user.id, {
        firstName,
        lastName,
        phone: phone || undefined,
        role,
        permissions: role === 'EMPLOYEE' ? permissions : [],
        status,
      });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('updateError'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <FormPanel title={`${t('editUser')}: ${user.email}`} tone="brand">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label={tAuth('firstName')}
            name="firstName"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <Input
            label={tAuth('lastName')}
            name="lastName"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <Input
          label={tAuth('phoneOptional')}
          name="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label={t('role')}
            id="edit-role"
            value={role}
            disabled={isTargetManager && !canEditManagerFields}
            onChange={(e) => {
              const nextRole = e.target.value as UserRole;
              setRole(nextRole);
              if (nextRole === 'MANAGER') {
                setPermissions([]);
              }
            }}
          >
            <option value="EMPLOYEE">{tRoles('EMPLOYEE')}</option>
            {canEditManagerFields && (
              <option value="MANAGER">{tRoles('MANAGER')}</option>
            )}
          </SelectField>

          <SelectField
            label={t('status')}
            id="edit-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as UserStatus)}
          >
            <option value="ACTIVE">{tStatus('ACTIVE')}</option>
            <option value="PENDING">{tStatus('PENDING')}</option>
            <option value="INACTIVE">{tStatus('INACTIVE')}</option>
          </SelectField>
        </div>

        <UserPermissionsEditor
          role={role}
          permissions={permissions}
          actorRole={actorRole}
          onChange={setPermissions}
        />

        <div className="flex flex-wrap gap-2">
          <Button type="submit" isLoading={isLoading} loadingLabel={tCommon('pleaseWait')}>
            {t('saveChanges')}
          </Button>
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t('cancel')}
          </Button>
        </div>
      </form>
    </FormPanel>
  );
}
