import { getTranslations } from 'next-intl/server';
import { StudentRegisterTabs } from '@/components/students/StudentRegisterTabs';

export default async function StudentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('students');

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 pt-6">
        <h2 className="text-base font-semibold text-slate-900">
          {t('moduleTitle')}
        </h2>
        <div className="mt-4">
          <StudentRegisterTabs />
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
