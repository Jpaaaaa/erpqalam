import { getTranslations } from 'next-intl/server';
import { LoginForm } from '@/components/auth/LoginForm';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return { title: t('loginTitle') };
}

export default async function LoginPage() {
  const t = await getTranslations('auth');

  return (
    <div>
      <h2 className="mb-6 text-xl font-semibold text-slate-900">{t('signIn')}</h2>
      <LoginForm />
    </div>
  );
}
