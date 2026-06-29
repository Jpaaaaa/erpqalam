import { getTranslations } from 'next-intl/server';
import { StudentCheckInForm } from '@/components/students/StudentCheckInForm';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return { title: t('studentCheckInTitle') };
}

export default async function StudentCheckInPage() {
  const t = await getTranslations('students');

  return (
    <div>
      <h2 className="mb-2 text-xl font-semibold text-slate-900">
        {t('checkInTitle')}
      </h2>
      <p className="mb-6 text-sm text-slate-500">{t('checkInDescription')}</p>
      <StudentCheckInForm />
    </div>
  );
}
