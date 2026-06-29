'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

export function Header() {
  const t = useTranslations('dashboard');
  const tAuth = useTranslations('auth');
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{t('title')}</h1>
        <p className="text-sm text-slate-500">
          {user ? t('welcomeBack', { name: user.firstName }) : ''}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <Button variant="secondary" onClick={handleLogout}>
          {tAuth('signOut')}
        </Button>
      </div>
    </header>
  );
}
