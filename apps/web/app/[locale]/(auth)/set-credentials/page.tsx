import { getTranslations } from 'next-intl/server';
import { SetCredentialsForm } from '@/components/auth/SetCredentialsForm';
import { SessionGate } from '@/components/auth/SessionGate';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return { title: t('setCredentialsTitle') };
}

export default async function SetCredentialsPage() {
  const t = await getTranslations('auth');

  return (
    <SessionGate mode="set-credentials">
      <h2 className="mb-6 text-xl font-semibold text-slate-900">
        {t('setCredentialsTitle')}
      </h2>
      <SetCredentialsForm />
    </SessionGate>
  );
}
