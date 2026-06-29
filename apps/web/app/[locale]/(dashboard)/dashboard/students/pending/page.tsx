import { getTranslations } from 'next-intl/server';
import { PendingStudentsPanel } from '@/components/students/PendingStudentsPanel';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return { title: t('studentsPendingTitle') };
}

export default async function PendingStudentsPage() {
  const t = await getTranslations('students');

  return (
    <div>
      <p className="text-sm text-slate-600">{t('pendingDescription')}</p>
      <div className="mt-6">
        <PendingStudentsPanel />
      </div>
    </div>
  );
}
