import { getTranslations } from 'next-intl/server';
import { RegisteredStudentsList } from '@/components/students/RegisteredStudentsList';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return { title: t('studentsRegisteredTitle') };
}

export default async function RegisteredStudentsPage() {
  const t = await getTranslations('students');

  return (
    <div>
      <p className="text-sm text-slate-600">{t('registeredDescription')}</p>
      <div className="mt-6">
        <RegisteredStudentsList />
      </div>
    </div>
  );
}
