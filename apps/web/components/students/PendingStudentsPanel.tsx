'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PendingStudentForm } from '@/components/students/PendingStudentForm';
import { PendingStudentsList } from '@/components/students/PendingStudentsList';
import { StudentDetailsModal } from '@/components/students/StudentDetailsModal';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/lib/auth/context';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import type { PendingStudent } from '@/lib/types/student';

export function PendingStudentsPanel() {
  const t = useTranslations('students');
  const { user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [detailsTarget, setDetailsTarget] = useState<PendingStudent | null>(null);

  const canAdd =
    user != null &&
    hasPermission(user.role, user.permissions, PERMISSIONS.REGISTRATION_MANAGE);

  return (
    <div className="space-y-4">
      <PendingStudentsList
        refreshKey={refreshKey}
        onAdd={canAdd ? () => setFormOpen(true) : undefined}
      />

      <Modal
        open={formOpen}
        title={t('pendingFormTitle')}
        size="lg"
        onClose={() => setFormOpen(false)}
      >
        <PendingStudentForm
          onSubmitted={(record) => {
            setFormOpen(false);
            setRefreshKey((k) => k + 1);
            setDetailsTarget(record);
          }}
        />
      </Modal>

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
