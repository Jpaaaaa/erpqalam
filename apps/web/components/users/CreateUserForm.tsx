'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiClientError, createUser } from '@/lib/api/users';
import type { UserRole } from '@/lib/types/user';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { FormPanel } from '@/components/ui/FormPanel';
import { SelectField } from '@/components/ui/SelectField';
import { canGrantUserManagement } from '@/lib/permissions';

interface CreateUserFormProps {
  actorRole: UserRole;
  onCreated: () => void;
  onCancel: () => void;
}

export function CreateUserForm({ actorRole, onCreated, onCancel }: CreateUserFormProps) {
  const t = useTranslations('users');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const tRoles = useTranslations('roles');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('EMPLOYEE');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const canCreateManager = canGrantUserManagement(actorRole);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await createUser({
        email,
        password,
        firstName,
        lastName,
        phone: phone || undefined,
        role,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('createError'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <FormPanel title={t('createUser')}>
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
        label={tAuth('email')}
        name="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Input
        label={tAuth('password')}
        name="password"
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Input
        label={tAuth('phoneOptional')}
        name="phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <SelectField
        label={t('role')}
        id="role"
        value={role}
        onChange={(e) => setRole(e.target.value as UserRole)}
      >
        <option value="EMPLOYEE">{tRoles('EMPLOYEE')}</option>
        {canCreateManager && (
          <option value="MANAGER">{tRoles('MANAGER')}</option>
        )}
      </SelectField>

      <p className="text-sm text-slate-500">{t('permissionsManagedSeparately')}</p>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" isLoading={isLoading} loadingLabel={tCommon('pleaseWait')}>
          {t('createUser')}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t('cancel')}
        </Button>
      </div>
      </form>
    </FormPanel>
  );
}
