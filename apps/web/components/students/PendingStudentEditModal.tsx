'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ApiClientError, updatePendingStudent } from '@/lib/api/students';
import {
  formToUpdatePayload,
  pendingStudentToForm,
  validatePendingFormForEdit,
  type PendingStudentFormState,
} from '@/lib/students/pending-form';
import type { PendingStudent } from '@/lib/types/student';
import { CameViaWhatField } from '@/components/students/CameViaWhatField';
import { SectionField } from '@/components/students/SectionField';
import { CloseIcon, SaveIcon } from '@/components/students/StudentListActionIcons';
import { Alert } from '@/components/ui/Alert';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

interface PendingStudentEditModalProps {
  open: boolean;
  student: PendingStudent;
  onClose: () => void;
  onSaved?: (record: PendingStudent) => void;
}

export function PendingStudentEditModal({
  open,
  student,
  onClose,
  onSaved,
}: PendingStudentEditModalProps) {
  const t = useTranslations('students');
  const tDetails = useTranslations('students.detailsForm');
  const tDoc = useTranslations('students.documentRequest');
  const tCommon = useTranslations('common');
  const [form, setForm] = useState<PendingStudentFormState>(() =>
    pendingStudentToForm(student),
  );
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(pendingStudentToForm(student));
      setError('');
    }
  }, [open, student]);

  function updateField(field: keyof PendingStudentFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updatePhone(index: 0 | 1, value: string) {
    setForm((prev) => {
      const phoneNumbers = [...prev.phoneNumbers] as [string, string];
      phoneNumbers[index] = value;
      return { ...prev, phoneNumbers };
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    const validationError = validatePendingFormForEdit(form);
    if (validationError) {
      setError(t(validationError));
      return;
    }

    setIsLoading(true);

    try {
      const updated = await updatePendingStudent(student.id, formToUpdatePayload(form));
      onSaved?.(updated);
      onClose();
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('pendingEditError');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('pendingEditTitle')}
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <IconButton label={tDoc('cancel')} onClick={onClose}>
            <CloseIcon className="h-5 w-5" />
          </IconButton>
          <IconButton
            type="submit"
            form="pending-student-edit-form"
            variant="primary"
            label={tDetails('save')}
            isLoading={isLoading}
            loadingLabel={tCommon('pleaseWait')}
          >
            <SaveIcon className="h-5 w-5" />
          </IconButton>
        </div>
      }
    >
      <form id="pending-student-edit-form" onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert variant="error">{error}</Alert>}

        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-slate-800">
            {t('fullName')}
          </legend>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Input
              label={t('firstName')}
              name="firstName"
              required
              value={form.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
            />
            <Input
              label={t('secondName')}
              name="secondName"
              required
              value={form.secondName}
              onChange={(e) => updateField('secondName', e.target.value)}
            />
            <Input
              label={t('thirdName')}
              name="thirdName"
              value={form.thirdName}
              onChange={(e) => updateField('thirdName', e.target.value)}
            />
            <Input
              label={t('fourthName')}
              name="fourthName"
              value={form.fourthName}
              onChange={(e) => updateField('fourthName', e.target.value)}
            />
          </div>
        </fieldset>

        <SectionField
          value={form.section}
          onChange={(section) => updateField('section', section)}
        />

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-slate-800">
            {t('phoneNumbers')}
          </legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label={t('mobilePrimary')}
              name="phone-0"
              type="tel"
              value={form.phoneNumbers[0]}
              onChange={(e) => updatePhone(0, e.target.value)}
            />
            <Input
              label={t('mobileSecondary')}
              name="phone-1"
              type="tel"
              value={form.phoneNumbers[1]}
              onChange={(e) => updatePhone(1, e.target.value)}
            />
          </div>
        </fieldset>

        <CameViaWhatField
          source={form.cameViaSource}
          friendDetail={form.cameViaFriendDetail}
          onSourceChange={(source) => updateField('cameViaSource', source)}
          onFriendDetailChange={(detail) => updateField('cameViaFriendDetail', detail)}
        />

        <div className="space-y-1.5">
          <label htmlFor="guardianInfo" className="block text-sm font-medium text-slate-700">
            {t('guardianInfo')}
          </label>
          <textarea
            id="guardianInfo"
            name="guardianInfo"
            rows={3}
            value={form.guardianInfo}
            onChange={(e) => updateField('guardianInfo', e.target.value)}
            placeholder={t('guardianInfoPlaceholder')}
            className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
      </form>
    </Modal>
  );
}
