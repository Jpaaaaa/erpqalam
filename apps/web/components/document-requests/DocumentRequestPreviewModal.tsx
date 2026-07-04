'use client';

import { useTranslations } from 'next-intl';
import { downloadDocumentRequestPdf } from '@/lib/api/document-requests';
import { DocumentRequestPdfViewer } from '@/components/document-requests/DocumentRequestPdfViewer';
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

  function handleDownload() {
    if (!previewBlob) return;
    downloadDocumentRequestPdf(previewBlob, documentNumber);
  }

  if (!open || !previewBlob) {
    return null;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('previewTitle')}
      size="a4"
      overlayClassName="z-[60]"
      panelClassName="z-[61]"
      contentClassName="overflow-hidden px-4 py-3"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('close')}
          </Button>
          <Button type="button" onClick={handleDownload}>
            {t('download')}
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <p className="text-center text-xs text-slate-500">
          {t('documentNumber')}:{' '}
          <span className="font-medium text-slate-800">{documentNumber}</span>
        </p>

        <DocumentRequestPdfViewer blob={previewBlob} />
      </div>
    </Modal>
  );
}
