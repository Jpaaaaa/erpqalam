'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/lib/auth/context';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { AppLogoIcon } from '@/components/layout/NavIcons';

function LogOutIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
      />
    </svg>
  );
}

export function Header() {
  const t = useTranslations('dashboard');
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const { user, logout } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <header className="flex items-center justify-between gap-3 rounded-3xl bg-brand-gradient px-4 py-3 text-white shadow-soft sm:rounded-4xl sm:px-6 sm:py-4">
      <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm sm:h-12 sm:w-12">
          <AppLogoIcon className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-base font-bold tracking-tight sm:text-xl">
            {tCommon('appName')}
          </h1>
          <p className="truncate text-xs text-white/85 sm:text-sm">
            {user ? t('welcomeBack', { name: user.firstName }) : t('title')}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <LanguageSwitcher variant="pills" compact />
        <button
          type="button"
          onClick={handleLogout}
          aria-label={tAuth('signOut')}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition hover:bg-white/30 active:scale-95 sm:h-auto sm:w-auto sm:px-4 sm:py-2"
        >
          <span className="sm:hidden">
            <LogOutIcon />
          </span>
          <span className="hidden text-sm font-medium sm:inline">{tAuth('signOut')}</span>
        </button>
      </div>
    </header>
  );
}
