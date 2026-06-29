'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth/context';
import { API_BASE_URL, ApiClientError } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { ArrowNavForm } from '@/components/ui/ArrowNavForm';

function setOAuthLocaleCookie(locale: string): void {
  const isProduction = window.location.hostname.endsWith('erpqalam.dev');
  const domain = isProduction ? '; domain=.erpqalam.dev' : '';
  document.cookie = `oauth_locale=${locale}; path=/; max-age=300; SameSite=Lax${domain}`;
}

export function LoginForm() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      setError(oauthError);
    }
  }, [searchParams]);

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

  function handleGoogleLogin() {
    setError('');
    setOAuthLocaleCookie(locale);
    window.location.href = `${API_BASE_URL}/auth/google`;
  }

  return (
    <ArrowNavForm onSubmit={handleSubmit} className="space-y-5">
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

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-500">{t('orContinueWith')}</span>
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={handleGoogleLogin}
      >
        {t('signInWithGoogle')}
      </Button>

      <p className="text-center text-sm text-slate-600">
        {t('newEmployee')}{' '}
        <Link href="/register" className="font-semibold text-teal-600 hover:text-teal-500">
          {t('registerHere')}
        </Link>
      </p>
    </ArrowNavForm>
  );
}
