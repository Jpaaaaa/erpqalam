'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { formatStudentName } from '@/lib/students/format';
import type { Student } from '@/lib/types/student';

interface RestoreStudentModalProps {
  open: boolean;
  student: Student | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function RestoreStudentModal({
  open,
  student,
  isSubmitting = false,
  onClose,
  onConfirm,
}: RestoreStudentModalProps) {
  const t = useTranslations('students');
  const tCommon = useTranslations('common');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) {
      setReason('');
    }
  }, [open]);

  if (!student) {
    return null;
  }

  function handleClose() {
    if (isSubmitting) return;
    setReason('');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t('restoreToPendingTitle')}
      size="md"
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {t('restoreCancel')}
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm(reason.trim())}
            isLoading={isSubmitting}
            loadingLabel={tCommon('pleaseWait')}
          >
            {t('restoreConfirm')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          {t('restoreToPendingDescription', { name: formatStudentName(student) })}
        </p>
        <div className="space-y-1.5">
          <label htmlFor="restore-reason" className="block text-sm font-medium text-slate-700">
            {t('restoreReason')}
          </label>
          <textarea
            id="restore-reason"
            name="restore-reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('restoreReasonPlaceholder')}
            className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </div>
    </Modal>
  );
}
