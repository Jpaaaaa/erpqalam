'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ApiClientError,
  checkDocumentRequestNumber,
  generateDocumentRequest,
  getDocumentRequestCreateDefaults,
  openDocumentRequestPdfInNewTab,
} from '@/lib/api/document-requests';
import type { CreateDocumentRequestTarget } from '@/lib/types/document-request';
import { getDefaultAcademicYear } from '@/lib/utils/academic-year';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

interface DocumentRequestModalProps {
  open: boolean;
  target: CreateDocumentRequestTarget | null;
  onClose: () => void;
  onGenerated?: () => void;
}

export function DocumentRequestModal({
  open,
  target,
  onClose,
  onGenerated,
}: DocumentRequestModalProps) {
  const t = useTranslations('students.documentRequest');
  const tCommon = useTranslations('common');
  const [previousSchoolName, setPreviousSchoolName] = useState('');
  const [language, setLanguage] = useState<'ar' | 'ku'>('ar');
  const [academicYear, setAcademicYear] = useState('');
  const [documentNumberSuffix, setDocumentNumberSuffix] = useState('');
  const [prefix, setPrefix] = useState('');
  const [nextDocumentNumber, setNextDocumentNumber] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(false);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setIsLoadingDefaults(true);
    setError('');

    getDocumentRequestCreateDefaults()
      .then((defaults) => {
        if (cancelled) return;
        setPrefix(defaults.prefix);
        setNextDocumentNumber(defaults.nextDocumentNumber);
        setAcademicYear(defaults.academicYear);
      })
      .catch(() => {
        if (cancelled) return;
        setAcademicYear(getDefaultAcademicYear());
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingDefaults(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const suffix = documentNumberSuffix.trim();
    if (!suffix) {
      setDuplicateWarning('');
      return;
    }

    const fullNumber = `${prefix}${suffix}`;
    const timeoutId = window.setTimeout(() => {
      checkDocumentRequestNumber(fullNumber)
        .then((result) => {
          setDuplicateWarning(
            result.exists ? t('duplicateNumberWarning', { number: fullNumber }) : '',
          );
        })
        .catch(() => {
          setDuplicateWarning('');
        });
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [documentNumberSuffix, open, prefix, t]);

  function resetForm() {
    setPreviousSchoolName('');
    setLanguage('ar');
    setAcademicYear('');
    setDocumentNumberSuffix('');
    setPrefix('');
    setNextDocumentNumber('');
    setDuplicateWarning('');
    setError('');
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!target) return;

    setError('');
    setIsLoading(true);

    const suffix = documentNumberSuffix.trim();
    const payload = {
      previousSchoolName: previousSchoolName.trim(),
      academicYear: academicYear.trim(),
      language,
      studentId: target.studentId,
      pendingStudentId: target.pendingStudentId,
      ...(suffix ? { documentNumber: `${prefix}${suffix}` } : {}),
    };

    try {
      const result = await generateDocumentRequest(payload);

      openDocumentRequestPdfInNewTab(result.blob);
      onGenerated?.();
      handleClose();
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('generateError');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  if (!target) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t('title')}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose}>
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            form="document-request-form"
            isLoading={isLoading}
            loadingLabel={tCommon('pleaseWait')}
            disabled={isLoadingDefaults || Boolean(duplicateWarning)}
          >
            {t('generate')}
          </Button>
        </>
      }
    >
      <form id="document-request-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}
        {duplicateWarning && <Alert variant="info">{duplicateWarning}</Alert>}

        <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {t('studentName')}
          </p>
          <p className="mt-1 font-medium text-slate-900">{target.studentName}</p>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-700">
            {t('languageLabel')}
          </legend>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLanguage('ar')}
              className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                language === 'ar'
                  ? 'border-teal-500 bg-teal-50 text-teal-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              {t('languageArabic')}
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ku')}
              className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                language === 'ku'
                  ? 'border-teal-500 bg-teal-50 text-teal-900'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              {t('languageKurdish')}
            </button>
          </div>
        </fieldset>

        <Input
          label={t('previousSchoolName')}
          name="previousSchoolName"
          required
          value={previousSchoolName}
          onChange={(e) => setPreviousSchoolName(e.target.value)}
          placeholder={t('previousSchoolNamePlaceholder')}
        />

        <Input
          label={t('academicYear')}
          name="academicYear"
          required
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          placeholder={t('academicYearPlaceholder')}
          disabled={isLoadingDefaults}
        />

        <div>
          <Input
            label={t('documentNumber')}
            name="documentNumber"
            value={documentNumberSuffix}
            onChange={(e) => setDocumentNumberSuffix(e.target.value.replace(/\D/g, ''))}
            placeholder={nextDocumentNumber.replace(prefix, '') || undefined}
            disabled={isLoadingDefaults}
            inputMode="numeric"
          />
          <p className="mt-1 text-xs text-slate-500">
            {t('documentNumberHint', {
              prefix,
              nextNumber: nextDocumentNumber || '—',
            })}
          </p>
        </div>

        <p className="text-xs text-slate-500">{t('hint')}</p>
      </form>
    </Modal>
  );
}
