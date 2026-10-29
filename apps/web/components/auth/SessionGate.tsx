'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth/context';
import { getPostAuthPath } from '@/lib/auth/post-auth-redirect';

type SessionGateMode = 'set-credentials' | 'change-password';

interface SessionGateProps {
  mode: SessionGateMode;
  children: React.ReactNode;
}

export function SessionGate({ mode, children }: SessionGateProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations('common');

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }

    if (mode === 'set-credentials') {
      if (!user.needsSetupCredentials) {
        router.replace(getPostAuthPath(user));
      }
      return;
    }

    if (!user.mustChangePassword) {
      router.replace(getPostAuthPath(user));
    }
  }, [user, isAuthenticated, isLoading, mode, router]);

  if (isLoading) {
    return (
      <p className="text-center text-sm text-slate-500">{t('loading')}</p>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (mode === 'set-credentials' && user.needsSetupCredentials) {
    return <>{children}</>;
  }

  if (mode === 'change-password' && user.mustChangePassword) {
    return <>{children}</>;
  }

  return null;
}
