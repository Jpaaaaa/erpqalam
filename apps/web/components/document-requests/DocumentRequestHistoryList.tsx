'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ApiClientError, listDocumentRequests } from '@/lib/api/document-requests';
import { formatStaffName } from '@/lib/students/format';
import type { DocumentRequestLetter } from '@/lib/types/document-request';
import { Alert } from '@/components/ui/Alert';
import { DetailRow, MobileCard } from '@/components/ui/MobileCard';

function formatDate(value: string, locale: string) {
  return new Date(value).toLocaleDateString(locale);
}

export function DocumentRequestHistoryList() {
  const locale = useLocale();
  const t = useTranslations('documentRequests.history');
  const tCommon = useTranslations('common');
  const [letters, setLetters] = useState<DocumentRequestLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await listDocumentRequests({ limit: 100 });
      setLetters(result.data);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('loadError');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <p className="text-sm text-slate-500">{tCommon('loading')}</p>;
  }

  return (
    <div className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      {letters.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          {t('empty')}
        </p>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {letters.map((letter) => (
              <MobileCard key={letter.id}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-slate-900">
                      {letter.studentFullName}
                    </p>
                    <span className="shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800">
                      {letter.documentNumber}
                    </span>
                  </div>
                  <div className="grid gap-3">
                    <DetailRow label={t('date')}>
                      {formatDate(letter.documentDate, locale)}
                    </DetailRow>
                    <DetailRow label={t('previousSchool')}>
                      {letter.previousSchoolName}
                    </DetailRow>
                    <DetailRow label={t('generatedBy')}>
                      {formatStaffName(letter.generatedBy)}
                    </DetailRow>
                  </div>
                </div>
              </MobileCard>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl bg-slate-50/50 shadow-sm md:block">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('documentNumber')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('date')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('studentName')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('previousSchool')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('generatedBy')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {letters.map((letter) => (
                  <tr key={letter.id} className="align-top transition hover:bg-slate-50/80">
                    <td className="px-4 py-3.5 font-medium text-slate-900">
                      {letter.documentNumber}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {formatDate(letter.documentDate, locale)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-900">
                      {letter.studentFullName}
                    </td>
                    <td className="max-w-xs px-4 py-3.5 text-slate-600">
                      {letter.previousSchoolName}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {formatStaffName(letter.generatedBy)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
