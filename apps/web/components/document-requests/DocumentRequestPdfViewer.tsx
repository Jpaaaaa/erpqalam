'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

interface DocumentRequestPdfViewerProps {
  blob: Blob;
  className?: string;
}

export function DocumentRequestPdfViewer({
  blob,
  className = '',
}: DocumentRequestPdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const tCommon = useTranslations('common');
  const t = useTranslations('students.documentRequest');

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    const pages = pagesRef.current;
    if (!container || !pages) return;

    async function renderPdf() {
      if (!container || !pages) return;

      setLoading(true);
      setError('');
      pages.replaceChildren();

      try {
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

        const data = await blob.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data }).promise;

        if (cancelled) return;

        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
          });
        });

        if (cancelled) return;

        const availableWidth = container.clientWidth;
        let availableHeight = container.clientHeight;
        if (availableHeight <= 0) {
          availableHeight = availableWidth * (297 / 210);
        }

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
          const page = await pdf.getPage(pageNum);
          if (cancelled) return;

          const baseViewport = page.getViewport({ scale: 1 });
          const scale = Math.min(
            availableWidth / baseViewport.width,
            availableHeight / baseViewport.height,
          );
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = 'block h-auto max-h-full w-auto max-w-full';

          const wrapper = document.createElement('div');
          wrapper.className =
            'flex h-full w-full items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm';
          wrapper.appendChild(canvas);
          pages.appendChild(wrapper);

          await page
            .render({
              canvasContext: context,
              viewport,
              canvas,
            })
            .promise;
        }
      } catch {
        if (!cancelled) {
          setError(t('previewError'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void renderPdf();

    return () => {
      cancelled = true;
      pages.replaceChildren();
    };
  }, [blob, t]);

  return (
    <div ref={containerRef} className={`relative h-full min-h-0 w-full ${className}`}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md border border-slate-200 bg-white">
          <p className="text-sm text-slate-500">{tCommon('loading')}</p>
        </div>
      )}
      {error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : (
        <div ref={pagesRef} className="flex h-full min-h-0 flex-col gap-2" />
      )}
    </div>
  );
}
