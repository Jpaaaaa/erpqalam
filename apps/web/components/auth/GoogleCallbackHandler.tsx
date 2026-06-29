'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { saveSession } from '@/lib/auth/storage';
import type { AuthUser } from '@/lib/types/auth';
import { Alert } from '@/components/ui/Alert';

function decodeBase64Url(value: string): string {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  return decodeURIComponent(
    atob(base64)
      .split('')
      .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
      .join(''),
  );
}

export function GoogleCallbackHandler() {
  const t = useTranslations('auth');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userParam = searchParams.get('user');

    if (!accessToken || !refreshToken || !userParam) {
      setError(t('googleCallbackError'));
      return;
    }

    try {
      const user = JSON.parse(decodeBase64Url(userParam)) as AuthUser;

      saveSession({
        user,
        tokens: { accessToken, refreshToken },
      });

      window.location.href = `/${locale}/dashboard`;
    } catch {
      setError(t('googleCallbackError'));
    }
  }, [locale, searchParams, t]);

  if (error) {
    return <Alert variant="error">{error}</Alert>;
  }

  return (
    <p className="text-center text-sm text-slate-600">{tCommon('redirecting')}</p>
  );
}
