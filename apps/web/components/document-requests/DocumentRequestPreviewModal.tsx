'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  downloadDocumentRequestPdf,
  openDocumentRequestPdfInNewTab,
} from '@/lib/api/document-requests';
import { DocumentRequestPdfViewer } from '@/components/document-requests/DocumentRequestPdfViewer';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface DocumentRequestPreviewModalProps {
  open: boolean;
  previewBlob: Blob | null;
  documentNumber: string;
  onClose: () => void;
}

export function DocumentRequestPreviewModal({
  open,
  previewBlob,
  documentNumber,
  onClose,
}: DocumentRequestPreviewModalProps) {
  const t = useTranslations('students.documentRequest');
  const [printError, setPrintError] = useState('');

  function handleDownload() {
    if (!previewBlob) return;
    downloadDocumentRequestPdf(previewBlob, documentNumber);
  }

  function handlePrint() {
    if (!previewBlob) return;

    setPrintError('');
    const opened = openDocumentRequestPdfInNewTab(previewBlob, documentNumber);
    if (!opened) {
      setPrintError(t('printBlocked'));
    }
  }

  function handleClose() {
    setPrintError('');
    onClose();
  }

  if (!open || !previewBlob) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t('previewTitle')}
      size="a4"
      overlayClassName="z-[60] !items-center p-4"
      panelClassName="z-[61] !rounded-2xl min-w-0"
      contentClassName="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-3 py-2"
      footerClassName="flex-col px-3 py-3 sm:flex-col"
      footer={
        <>
          <Button type="button" variant="secondary" className="w-full" onClick={handleClose}>
            {t('close')}
          </Button>
          <Button type="button" variant="secondary" className="w-full" onClick={handleDownload}>
            {t('download')}
          </Button>
          <Button type="button" className="w-full" onClick={handlePrint}>
            {t('printInNewTab')}
          </Button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <p className="shrink-0 text-center text-xs text-slate-500">
          {t('documentNumber')}:{' '}
          <span className="font-medium text-slate-800">{documentNumber}</span>
        </p>

        {printError && <Alert variant="error">{printError}</Alert>}

        <DocumentRequestPdfViewer blob={previewBlob} className="min-h-0 flex-1" />
      </div>
    </Modal>
  );
}
