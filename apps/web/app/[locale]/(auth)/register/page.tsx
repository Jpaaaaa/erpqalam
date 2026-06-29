import { getTranslations } from 'next-intl/server';
import { RegisterForm } from '@/components/auth/RegisterForm';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return { title: t('registerTitle') };
}

export default async function RegisterPage() {
  const t = await getTranslations('auth');

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-slate-900">
        {t('employeeRegistration')}
      </h2>
      <p className="mb-6 text-sm text-slate-500">{t('registerDescription')}</p>
      <RegisterForm />
    </div>
  );
}
