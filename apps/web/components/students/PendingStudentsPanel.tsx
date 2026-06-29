'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PendingStudentForm } from '@/components/students/PendingStudentForm';
import { PendingStudentsList } from '@/components/students/PendingStudentsList';
import { FormPanel } from '@/components/ui/FormPanel';

export function PendingStudentsPanel() {
  const t = useTranslations('students');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <FormPanel title={t('pendingFormTitle')}>
        <PendingStudentForm onSubmitted={() => setRefreshKey((k) => k + 1)} />
      </FormPanel>
      <div>
        <h3 className="mb-4 text-sm font-semibold text-slate-900">
          {t('pendingListTitle')}
        </h3>
        <PendingStudentsList refreshKey={refreshKey} />
      </div>
    </div>
  );
}
