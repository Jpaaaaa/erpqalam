import { getTranslations } from 'next-intl/server';
import { StudentRegisterTabs } from '@/components/students/StudentRegisterTabs';
import { PageCard } from '@/components/ui/PageCard';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function StudentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('students');

  return (
    <PageCard padding="none">
      <div className="border-b border-slate-100 px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-6">
        <PageHeader title={t('moduleTitle')} className="mb-4" />
        <StudentRegisterTabs />
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </PageCard>
  );
}
