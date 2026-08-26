'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  ApiClientError,
  approvePendingStudent,
  deletePendingStudent,
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
import { PendingStudentEditModal } from '@/components/students/PendingStudentEditModal';
import { PendingStudentRowActions } from '@/components/students/PendingStudentRowActions';
import { StudentDetailsModal } from '@/components/students/StudentDetailsModal';

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
  const [editTarget, setEditTarget] = useState<PendingStudent | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<PendingStudent | null>(null);

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
    setActionId(`approve:${id}`);
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

  async function handleDelete(id: string) {
    if (!window.confirm(t('deletePendingConfirm'))) return;

    setActionId(`delete:${id}`);
    setError('');
    try {
      await deletePendingStudent(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      if (editTarget?.id === id) setEditTarget(null);
      if (detailsTarget?.id === id) setDetailsTarget(null);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('deleteError');
      setError(message);
    } finally {
      setActionId(null);
    }
  }

  function handleStudentSaved(updated: PendingStudent) {
    setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }

  if (loading) {
    return <p className="text-sm text-slate-500">{tCommon('loading')}</p>;
  }

  return (
    <div className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}

      {editTarget && (
        <PendingStudentEditModal
          open
          student={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleStudentSaved}
        />
      )}

      {detailsTarget && (
        <StudentDetailsModal
          open
          mode="pending"
          record={detailsTarget}
          onClose={() => setDetailsTarget(null)}
          onSaved={() => {
            void load();
          }}
        />
      )}

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
              const busy = actionId?.endsWith(`:${student.id}`) ?? false;

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
                    <div className="flex flex-col gap-2">
                      <PendingStudentRowActions
                        student={student}
                        onOpenDetails={() => setDetailsTarget(student)}
                        onOpenEdit={() => setEditTarget(student)}
                        onDelete={() => void handleDelete(student.id)}
                        isDeleting={actionId === `delete:${student.id}`}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full"
                        disabled={!canApprove || busy}
                        isLoading={actionId === `approve:${student.id}`}
                        loadingLabel={tCommon('pleaseWait')}
                        onClick={() => handleApprove(student.id)}
                      >
                        {t('markRegistered')}
                      </Button>
                    </div>
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
                  const busy = actionId?.endsWith(`:${student.id}`) ?? false;

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
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          <PendingStudentRowActions
                            student={student}
                            onOpenDetails={() => setDetailsTarget(student)}
                            onOpenEdit={() => setEditTarget(student)}
                            onDelete={() => void handleDelete(student.id)}
                            isDeleting={actionId === `delete:${student.id}`}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={!canApprove || busy}
                            title={
                              !canApprove
                                ? t('approveIncompleteHint')
                                : user
                                  ? t('registerAsYou', {
                                      name: formatStaffName(user),
                                    })
                                  : undefined
                            }
                            isLoading={actionId === `approve:${student.id}`}
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
