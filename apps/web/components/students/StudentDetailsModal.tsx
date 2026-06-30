'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ApiClientError,
  updatePendingStudentDetails,
  updateStudentDetails,
} from '@/lib/api/students';
import {
  detailsFormToPayload,
  recordToDetailsForm,
  type DetailsFormState,
  type StudentDetailsRecord,
} from '@/lib/students/details-form';
import { formatSectionValue } from '@/lib/students/format';
import { FormFieldLabel } from '@/components/students/FormFieldLabel';
import { ReadOnlyField } from '@/components/students/ReadOnlyField';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface StudentDetailsModalProps {
  open: boolean;
  mode: 'pending' | 'registered';
  record: StudentDetailsRecord;
  onClose: () => void;
  onSaved?: () => void;
}

function LabeledInput({
  labelKey,
  name,
  type = 'text',
  value,
  onChange,
}: {
  labelKey: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name}>
        <FormFieldLabel labelKey={labelKey} />
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
      />
    </div>
  );
}

export function StudentDetailsModal({
  open,
  mode,
  record,
  onClose,
  onSaved,
}: StudentDetailsModalProps) {
  const t = useTranslations('students');
  const tDetails = useTranslations('students.detailsForm');
  const tCommon = useTranslations('common');
  const [form, setForm] = useState<DetailsFormState>(() => recordToDetailsForm(record));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(recordToDetailsForm(record));
      setError('');
    }
  }, [open, record]);

  function updateField(field: keyof DetailsFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const payload = detailsFormToPayload(form);

    try {
      if (mode === 'pending') {
        await updatePendingStudentDetails(record.id, payload);
      } else {
        await updateStudentDetails(record.id, payload);
      }
      onSaved?.();
      onClose();
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : tDetails('saveError');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  const sectionLabel = record.section
    ? formatSectionValue(record.section, t)
    : '—';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={tDetails('title')}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            {tDetails('skip')}
          </Button>
          <Button
            type="submit"
            form="student-details-form"
            isLoading={isLoading}
            loadingLabel={tCommon('pleaseWait')}
          >
            {tDetails('save')}
          </Button>
        </>
      }
    >
      <form id="student-details-form" onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert variant="error">{error}</Alert>}

        <p className="rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800">
          {tDetails('alreadyRecordedHint')}
        </p>

        <fieldset className="space-y-4">
          <legend className="mb-2">
            <FormFieldLabel labelKey="fullName" />
          </legend>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ReadOnlyField label={t('firstName')} value={record.firstName} />
            <ReadOnlyField label={t('secondName')} value={record.secondName} />
            <ReadOnlyField label={t('thirdName')} value={record.thirdName ?? ''} />
            <ReadOnlyField label={t('fourthName')} value={record.fourthName ?? ''} />
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <ReadOnlyField label={t('section')} value={sectionLabel} />
          <LabeledInput
            labelKey="stage"
            name="stage"
            value={form.stage}
            onChange={(value) => updateField('stage', value)}
          />
        </div>

        <LabeledInput
          labelKey="homeAddress"
          name="homeAddress"
          value={form.homeAddress}
          onChange={(value) => updateField('homeAddress', value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledInput
            labelKey="birthPlace"
            name="birthPlace"
            value={form.birthPlace}
            onChange={(value) => updateField('birthPlace', value)}
          />
          <LabeledInput
            labelKey="birthDate"
            name="birthDate"
            type="date"
            value={form.birthDate}
            onChange={(value) => updateField('birthDate', value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <LabeledInput
            labelKey="nationalIdNumber"
            name="nationalIdNumber"
            value={form.nationalIdNumber}
            onChange={(value) => updateField('nationalIdNumber', value)}
          />
          <LabeledInput
            labelKey="residenceCardNumber"
            name="residenceCardNumber"
            value={form.residenceCardNumber}
            onChange={(value) => updateField('residenceCardNumber', value)}
          />
          <LabeledInput
            labelKey="foodRationCardNumber"
            name="foodRationCardNumber"
            value={form.foodRationCardNumber}
            onChange={(value) => updateField('foodRationCardNumber', value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledInput
            labelKey="studentMobile"
            name="studentMobile"
            type="tel"
            value={form.studentMobile}
            onChange={(value) => updateField('studentMobile', value)}
          />
          <LabeledInput
            labelKey="guardianName"
            name="guardianName"
            value={form.guardianName}
            onChange={(value) => updateField('guardianName', value)}
          />
        </div>

        <LabeledInput
          labelKey="guardianMobile"
          name="guardianMobile"
          type="tel"
          value={form.guardianMobile}
          onChange={(value) => updateField('guardianMobile', value)}
        />
      </form>
    </Modal>
  );
}
