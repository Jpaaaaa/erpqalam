'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ApiClientError,
  generateDocumentRequest,
} from '@/lib/api/document-requests';
import type { CreateDocumentRequestTarget } from '@/lib/types/document-request';
import { DocumentRequestPreviewModal } from '@/components/document-requests/DocumentRequestPreviewModal';
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
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [documentNumber, setDocumentNumber] = useState('');

  function resetPreview() {
    setPreviewBlob(null);
    setDocumentNumber('');
  }

  function handleClose() {
    setPreviousSchoolName('');
    setError('');
    resetPreview();
    onClose();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!target) return;

    setError('');
    setIsLoading(true);

    try {
      const result = await generateDocumentRequest({
        previousSchoolName: previousSchoolName.trim(),
        studentId: target.studentId,
        pendingStudentId: target.pendingStudentId,
      });

      resetPreview();
      setPreviewBlob(result.blob);
      setDocumentNumber(result.documentNumber);
      onGenerated?.();
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

  const isPreview = previewBlob !== null;

  return (
    <>
      <Modal
        open={open && !isPreview}
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
            >
              {t('generate')}
            </Button>
          </>
        }
      >
        <form id="document-request-form" onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {t('studentName')}
            </p>
            <p className="mt-1 font-medium text-slate-900">{target.studentName}</p>
          </div>

          <Input
            label={t('previousSchoolName')}
            name="previousSchoolName"
            required
            value={previousSchoolName}
            onChange={(e) => setPreviousSchoolName(e.target.value)}
            placeholder={t('previousSchoolNamePlaceholder')}
          />

          <p className="text-xs text-slate-500">{t('hint')}</p>
        </form>
      </Modal>

      <DocumentRequestPreviewModal
        open={open && isPreview}
        previewBlob={previewBlob}
        documentNumber={documentNumber}
        onClose={handleClose}
      />
    </>
  );
}
