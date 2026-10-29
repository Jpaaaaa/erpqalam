import { getTranslations } from 'next-intl/server';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { SessionGate } from '@/components/auth/SessionGate';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return { title: t('changePasswordTitle') };
}

export default async function ChangePasswordPage() {
  const t = await getTranslations('auth');

  return (
    <SessionGate mode="change-password">
      <h2 className="mb-6 text-xl font-semibold text-slate-900">
        {t('changePasswordTitle')}
      </h2>
      <ChangePasswordForm />
    </SessionGate>
  );
}
