'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth/context';
import { ApiClientError } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';

export function LoginForm() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('loginError');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert variant="error">{error}</Alert>}

      <Input
        label={t('email')}
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('emailPlaceholder')}
      />

      <Input
        label={t('password')}
        name="password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />

      <Button
        type="submit"
        className="w-full"
        isLoading={isLoading}
        loadingLabel={tCommon('pleaseWait')}
      >
        {t('signIn')}
      </Button>

      <p className="text-center text-sm text-slate-600">
        {t('newEmployee')}{' '}
        <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
          {t('registerHere')}
        </Link>
      </p>
    </form>
  );
}
