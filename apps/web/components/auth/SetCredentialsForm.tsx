'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { setCredentials } from '@/lib/api/client';
import { ApiClientError } from '@/lib/api/client';
import { getPostAuthPath } from '@/lib/auth/post-auth-redirect';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';

export function SetCredentialsForm() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    setIsLoading(true);

    try {
      const session = await setCredentials({ username: username.trim(), password });
      await refreshUser();
      router.replace(getPostAuthPath(session.user));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('setCredentialsError'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-slate-600">{t('setCredentialsDescription')}</p>
      {error && <Alert variant="error">{error}</Alert>}

      <Input
        label={t('username')}
        name="username"
        autoComplete="username"
        required
        minLength={3}
        maxLength={30}
        dir="ltr"
        className="text-start"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder={t('usernamePlaceholder')}
      />

      <Input
        label={t('password')}
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Input
        label={t('confirmPassword')}
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <Button
        type="submit"
        className="w-full"
        isLoading={isLoading}
        loadingLabel={tCommon('pleaseWait')}
      >
        {t('saveCredentials')}
      </Button>
    </form>
  );
}
