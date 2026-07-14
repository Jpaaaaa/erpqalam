'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ApiClientError as DocumentRequestApiError,
  fetchLatestDocumentRequestPdf,
} from '@/lib/api/document-requests';
import {
  ApiClientError,
  updatePendingStudent,
  updatePendingStudentDetails,
  updateStudent,
  updateStudentDetails,
} from '@/lib/api/students';
import {
  detailsFormToPayload,
  editFormToStudentPayload,
  recordToDetailsForm,
  type DetailsFormState,
  type StudentDetailsRecord,
} from '@/lib/students/details-form';
import { formatSectionValue, formatStudentName } from '@/lib/students/format';
import { DocumentRequestModal } from '@/components/document-requests/DocumentRequestModal';
import { DocumentRequestPreviewModal } from '@/components/document-requests/DocumentRequestPreviewModal';
import { FormFieldLabel } from '@/components/students/FormFieldLabel';
import { SectionField } from '@/components/students/SectionField';
import { ReadOnlyField } from '@/components/students/ReadOnlyField';
import { DocumentIcon } from '@/components/layout/NavIcons';
import {
  CloseIcon,
  PdfPreviewIcon,
  SaveIcon,
} from '@/components/students/StudentListActionIcons';
import { IconButton } from '@/components/ui/IconButton';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';

interface StudentDetailsModalProps {
  open: boolean;
  mode: 'pending' | 'registered';
  record: StudentDetailsRecord;
  sectionEditable?: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

function LabeledInput({
  labelKey,
  name,
  type = 'text',
  value,
  onChange,
  disabled = false,
  required = false,
}: {
  labelKey: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
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
        required={required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 transition focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-slate-50 disabled:text-slate-500"
      />
    </div>
  );
}

function NameField({
  label,
  name,
  value,
  onChange,
  editable,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  editable: boolean;
  required?: boolean;
}) {
  if (!editable) {
    return <ReadOnlyField label={label} value={value} />;
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        value={value}
        required={required}
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
  sectionEditable = false,
  onClose,
  onSaved,
}: StudentDetailsModalProps) {
  const t = useTranslations('students');
  const tDetails = useTranslations('students.detailsForm');
  const tCommon = useTranslations('common');
  const [form, setForm] = useState<DetailsFormState>(() => recordToDetailsForm(record));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [docRequestOpen, setDocRequestOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [documentNumber, setDocumentNumber] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(recordToDetailsForm(record));
      setError('');
    }
  }, [open, record]);

  function resetPreview() {
    setPreviewBlob(null);
    setDocumentNumber('');
  }

  function handlePreviewClose() {
    resetPreview();
    setPreviewOpen(false);
  }

  async function handlePreview() {
    setError('');
    setIsPreviewLoading(true);

    try {
      const result = await fetchLatestDocumentRequestPdf({
        studentId: mode === 'registered' ? record.id : undefined,
        pendingStudentId: mode === 'pending' ? record.id : undefined,
      });

      resetPreview();
      setPreviewBlob(result.blob);
      setDocumentNumber(result.documentNumber);
      setPreviewOpen(true);
    } catch (err) {
      const message =
        err instanceof DocumentRequestApiError && err.status === 404
          ? t('documentRequest.previewNotFound')
          : err instanceof DocumentRequestApiError
            ? err.message
            : t('documentRequest.previewError');
      setError(message);
    } finally {
      setIsPreviewLoading(false);
    }
  }

  function updateField(field: keyof DetailsFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');

    if (sectionEditable) {
      if (!form.section) {
        setError(t('sectionRequired'));
        return;
      }

      if (!form.firstName.trim() || !form.secondName.trim()) {
        setError(t('nameRequired'));
        return;
      }

      setIsLoading(true);

      const payload = editFormToStudentPayload(form);

      try {
        if (mode === 'pending') {
          await updatePendingStudent(record.id, payload);
        } else {
          await updateStudent(record.id, payload);
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

      return;
    }

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
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={sectionEditable ? t('editSectionTitle') : tDetails('title')}
        footer={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <IconButton label={tDetails('skip')} onClick={onClose}>
              <CloseIcon className="h-5 w-5" />
            </IconButton>
            <IconButton
              label={t('documentRequest.generateButton')}
              onClick={() => setDocRequestOpen(true)}
            >
              <DocumentIcon className="h-5 w-5" />
            </IconButton>
            <IconButton
              label={t('documentRequest.previewButton')}
              onClick={handlePreview}
              isLoading={isPreviewLoading}
              loadingLabel={tCommon('pleaseWait')}
            >
              <PdfPreviewIcon className="h-5 w-5" />
            </IconButton>
            <IconButton
              type="submit"
              form="student-details-form"
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
      <form id="student-details-form" onSubmit={handleSubmit} className="space-y-5">
        {error && <Alert variant="error">{error}</Alert>}

        {sectionEditable && (
          <p className="rounded-xl bg-teal-50 px-4 py-3 text-sm text-teal-800">
            {tDetails('sectionEditHint')}
          </p>
        )}

        <fieldset className="space-y-4">
          <legend className="mb-2">
            <FormFieldLabel labelKey="fullName" />
          </legend>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <NameField
              label={t('firstName')}
              name="firstName"
              value={form.firstName}
              onChange={(value) => updateField('firstName', value)}
              editable={sectionEditable}
              required={sectionEditable}
            />
            <NameField
              label={t('secondName')}
              name="secondName"
              value={form.secondName}
              onChange={(value) => updateField('secondName', value)}
              editable={sectionEditable}
              required={sectionEditable}
            />
            <NameField
              label={t('thirdName')}
              name="thirdName"
              value={form.thirdName}
              onChange={(value) => updateField('thirdName', value)}
              editable={sectionEditable}
            />
            <NameField
              label={t('fourthName')}
              name="fourthName"
              value={form.fourthName}
              onChange={(value) => updateField('fourthName', value)}
              editable={sectionEditable}
            />
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          {sectionEditable ? (
            <SectionField
              value={form.section}
              onChange={(section) => updateField('section', section)}
              required
            />
          ) : (
            <ReadOnlyField label={t('section')} value={sectionLabel} />
          )}
          <LabeledInput
            labelKey="stage"
            name="stage"
            value={form.stage}
            disabled={sectionEditable}
            onChange={(value) => updateField('stage', value)}
          />
        </div>

        <LabeledInput
          labelKey="homeAddress"
          name="homeAddress"
          value={form.homeAddress}
          disabled={sectionEditable}
          onChange={(value) => updateField('homeAddress', value)}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledInput
            labelKey="birthPlace"
            name="birthPlace"
            value={form.birthPlace}
            disabled={sectionEditable}
            onChange={(value) => updateField('birthPlace', value)}
          />
          <LabeledInput
            labelKey="birthDate"
            name="birthDate"
            type="date"
            value={form.birthDate}
            disabled={sectionEditable}
            onChange={(value) => updateField('birthDate', value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <LabeledInput
            labelKey="nationalIdNumber"
            name="nationalIdNumber"
            value={form.nationalIdNumber}
            disabled={sectionEditable}
            onChange={(value) => updateField('nationalIdNumber', value)}
          />
          <LabeledInput
            labelKey="residenceCardNumber"
            name="residenceCardNumber"
            value={form.residenceCardNumber}
            disabled={sectionEditable}
            onChange={(value) => updateField('residenceCardNumber', value)}
          />
          <LabeledInput
            labelKey="foodRationCardNumber"
            name="foodRationCardNumber"
            value={form.foodRationCardNumber}
            disabled={sectionEditable}
            onChange={(value) => updateField('foodRationCardNumber', value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <LabeledInput
            labelKey="studentMobile"
            name="studentMobile"
            type="tel"
            value={form.studentMobile}
            disabled={sectionEditable}
            onChange={(value) => updateField('studentMobile', value)}
          />
          <LabeledInput
            labelKey="guardianName"
            name="guardianName"
            value={form.guardianName}
            disabled={sectionEditable}
            onChange={(value) => updateField('guardianName', value)}
          />
        </div>

        <LabeledInput
          labelKey="guardianMobile"
          name="guardianMobile"
          type="tel"
          value={form.guardianMobile}
          disabled={sectionEditable}
          onChange={(value) => updateField('guardianMobile', value)}
        />
      </form>
    </Modal>

      <DocumentRequestModal
        open={docRequestOpen}
        target={{
          studentName: formatStudentName(record),
          studentId: mode === 'registered' ? record.id : undefined,
          pendingStudentId: mode === 'pending' ? record.id : undefined,
        }}
        onClose={() => setDocRequestOpen(false)}
      />

      <DocumentRequestPreviewModal
        open={previewOpen}
        previewBlob={previewBlob}
        documentNumber={documentNumber}
        onClose={handlePreviewClose}
      />
    </>
  );
}
