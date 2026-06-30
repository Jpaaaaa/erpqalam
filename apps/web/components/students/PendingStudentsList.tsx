'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  ApiClientError,
  approvePendingStudent,
  listPendingStudents,
} from '@/lib/api/students';
import {
  formatCameViaValue,
  formatPhoneNumbers,
  formatSectionValue,
  formatStaffName,
  formatStudentName,
} from '@/lib/students/format';
import type { PendingStudent } from '@/lib/types/student';
import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { DetailRow, MobileCard } from '@/components/ui/MobileCard';

function formatDate(value: string, locale: string) {
  return new Date(value).toLocaleString(locale);
}

interface PendingStudentsListProps {
  refreshKey?: number;
}

export function PendingStudentsList({ refreshKey = 0 }: PendingStudentsListProps) {
  const locale = useLocale();
  const t = useTranslations('students');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const [students, setStudents] = useState<PendingStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await listPendingStudents({ limit: 100 });
      setStudents(result.data);
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
  }, [load, refreshKey]);

  async function handleApprove(id: string) {
    setActionId(id);
    setError('');
    try {
      await approvePendingStudent(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('registerError');
      setError(message);
    } finally {
      setActionId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">{tCommon('loading')}</p>;
  }

  return (
    <div className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      {students.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          {t('noPending')}
        </p>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {students.map((student) => {
              const canApprove =
                Boolean(student.section?.trim()) && student.phoneNumbers.length === 2;

              return (
                <MobileCard key={student.id}>
                  <div className="space-y-3">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {formatStudentName(student)}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {t('submittedAt', {
                          date: formatDate(student.createdAt, locale),
                        })}
                      </p>
                    </div>
                    <div className="grid gap-3">
                      <DetailRow label={t('section')}>
                        {student.section ? (
                          formatSectionValue(student.section, t)
                        ) : (
                          <span className="text-amber-600">{t('sectionMissing')}</span>
                        )}
                      </DetailRow>
                      <DetailRow label={t('phoneNumbers')}>
                        {student.phoneNumbers.length > 0 ? (
                          formatPhoneNumbers(student.phoneNumbers)
                        ) : (
                          <span className="text-amber-600">{t('phonesMissing')}</span>
                        )}
                      </DetailRow>
                      <DetailRow label={t('cameViaWhat')}>
                        {formatCameViaValue(student.comeViaWho, t)}
                      </DetailRow>
                      <DetailRow label={t('guardianInfo')}>
                        {student.guardianInfo || t('noGuardianInfo')}
                      </DetailRow>
                      <DetailRow label={t('submittedBy')}>
                        {student.submittedBy
                          ? formatStaffName(student.submittedBy)
                          : t('checkInSubmission')}
                      </DetailRow>
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      disabled={!canApprove}
                      isLoading={actionId === student.id}
                      loadingLabel={tCommon('pleaseWait')}
                      onClick={() => handleApprove(student.id)}
                    >
                      {t('markRegistered')}
                    </Button>
                  </div>
                </MobileCard>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-2xl bg-slate-50/50 shadow-sm md:block">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('fullName')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('section')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('phoneNumbers')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('cameViaWhat')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('guardianInfo')}
                  </th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('submittedBy')}
                  </th>
                  <th className="px-4 py-3 text-end text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {students.map((student) => {
                  const canApprove =
                    Boolean(student.section?.trim()) && student.phoneNumbers.length === 2;

                  return (
                    <tr key={student.id} className="align-top transition hover:bg-slate-50/80">
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-900">
                          {formatStudentName(student)}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {t('submittedAt', {
                            date: formatDate(student.createdAt, locale),
                          })}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {student.section ? (
                          formatSectionValue(student.section, t)
                        ) : (
                          <span className="text-amber-600">{t('sectionMissing')}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {student.phoneNumbers.length > 0 ? (
                          formatPhoneNumbers(student.phoneNumbers)
                        ) : (
                          <span className="text-amber-600">{t('phonesMissing')}</span>
                        )}
                      </td>
                      <td className="max-w-xs px-4 py-3.5 text-slate-600">
                        {formatCameViaValue(student.comeViaWho, t)}
                      </td>
                      <td className="max-w-xs px-4 py-3.5 text-slate-600">
                        {student.guardianInfo || t('noGuardianInfo')}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {student.submittedBy
                          ? formatStaffName(student.submittedBy)
                          : t('checkInSubmission')}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={!canApprove}
                            title={
                              !canApprove
                                ? t('approveIncompleteHint')
                                : user
                                  ? t('registerAsYou', {
                                      name: formatStaffName(user),
                                    })
                                  : undefined
                            }
                            isLoading={actionId === student.id}
                            loadingLabel={tCommon('pleaseWait')}
                            onClick={() => handleApprove(student.id)}
                          >
                            {t('markRegistered')}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
