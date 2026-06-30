'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PendingStudentForm } from '@/components/students/PendingStudentForm';
import { PendingStudentsList } from '@/components/students/PendingStudentsList';
import { StudentDetailsModal } from '@/components/students/StudentDetailsModal';
import { FormPanel } from '@/components/ui/FormPanel';
import type { PendingStudent } from '@/lib/types/student';

export function PendingStudentsPanel() {
  const t = useTranslations('students');
  const [refreshKey, setRefreshKey] = useState(0);
  const [detailsTarget, setDetailsTarget] = useState<PendingStudent | null>(null);

  return (
    <div className="space-y-6">
      <FormPanel title={t('pendingFormTitle')}>
        <PendingStudentForm
          onSubmitted={(record) => {
            setRefreshKey((k) => k + 1);
            setDetailsTarget(record);
          }}
        />
      </FormPanel>
      <div>
        <h3 className="mb-4 text-sm font-semibold text-slate-900">
          {t('pendingListTitle')}
        </h3>
        <PendingStudentsList refreshKey={refreshKey} />
      </div>

      {detailsTarget && (
        <StudentDetailsModal
          open
          mode="pending"
          record={detailsTarget}
          onClose={() => setDetailsTarget(null)}
          onSaved={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
