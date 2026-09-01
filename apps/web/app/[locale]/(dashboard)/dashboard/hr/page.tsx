'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth/context';
import { Alert } from '@/components/ui/Alert';

export default function HrHomePage() {
  const t = useTranslations('hr');
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (user.role !== 'MANAGER') {
    return <Alert variant="error">{t('accessDenied')}</Alert>;
  }

  return (
    <p className="text-sm text-slate-600">{t('comingSoon')}</p>
  );
}
