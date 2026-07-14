'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ApiClientError,
  deleteDocumentRequestLetterheadTemplate,
  fetchDocumentRequestLetterheadTemplate,
  uploadDocumentRequestLetterheadTemplate,
} from '@/lib/api/document-requests';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';

interface LetterheadTemplateUploadProps {
  hasCustomTemplate: boolean;
  templateFileName?: string | null;
  onUpdated: () => Promise<void>;
}

export function LetterheadTemplateUpload({
  hasCustomTemplate,
  templateFileName,
  onUpdated,
}: LetterheadTemplateUploadProps) {
  const t = useTranslations('documentRequests.settings');
  const tCommon = useTranslations('common');
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');

  async function handleUpload() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError(t('letterheadNoFile'));
      return;
    }

    setError('');
    setSuccess('');
    setUploading(true);

    try {
      await uploadDocumentRequestLetterheadTemplate(file);
      setSuccess(t('letterheadUploadSuccess'));
      setSelectedFileName('');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      await onUpdated();
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('letterheadUploadError');
      setError(message);
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    setError('');
    setSuccess('');
    setRemoving(true);

    try {
      await deleteDocumentRequestLetterheadTemplate();
      setSuccess(t('letterheadRemoveSuccess'));
      await onUpdated();
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('letterheadRemoveError');
      setError(message);
    } finally {
      setRemoving(false);
    }
  }

  async function handlePreview() {
    setError('');
    setPreviewing(true);

    try {
      const blob = await fetchDocumentRequestLetterheadTemplate();
      const url = URL.createObjectURL(blob);
      const opened = window.open(url, '_blank');
      if (opened) {
        opened.opener = null;
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('letterheadPreviewError');
      setError(message);
    } finally {
      setPreviewing(false);
    }
  }

  return (
    <section className="space-y-4 border-t border-slate-200 pt-8">
      <div>
        <h2 className="text-base font-semibold text-slate-900">
          {t('letterheadTitle')}
        </h2>
        <p className="mt-1 text-sm text-slate-600">{t('letterheadDescription')}</p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
        {hasCustomTemplate ? (
          <p>
            {t('letterheadCurrent', {
              name: templateFileName ?? t('letterheadUploaded'),
            })}
          </p>
        ) : (
          <p>{t('letterheadDefault')}</p>
        )}
      </div>

      <div className="space-y-3">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="block w-full text-sm text-slate-600 file:me-4 file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-teal-800 hover:file:bg-teal-100"
          onChange={(event) => {
            setSelectedFileName(event.target.files?.[0]?.name ?? '');
            setError('');
            setSuccess('');
          }}
        />
        {selectedFileName && (
          <p className="text-xs text-slate-500">
            {t('letterheadSelected', { name: selectedFileName })}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={handleUpload}
          isLoading={uploading}
          loadingLabel={tCommon('pleaseWait')}
        >
          {t('letterheadUpload')}
        </Button>
        {hasCustomTemplate && (
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={handlePreview}
              isLoading={previewing}
              loadingLabel={tCommon('pleaseWait')}
            >
              {t('letterheadPreview')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleRemove}
              isLoading={removing}
              loadingLabel={tCommon('pleaseWait')}
            >
              {t('letterheadRemove')}
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
