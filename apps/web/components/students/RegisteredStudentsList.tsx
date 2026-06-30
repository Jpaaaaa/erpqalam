'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ApiClientError, listStudents } from '@/lib/api/students';
import {
  formatCameViaValue,
  formatPhoneNumbers,
  formatSectionValue,
  formatStaffName,
  formatStudentName,
} from '@/lib/students/format';
import type { Student } from '@/lib/types/student';
import { Alert } from '@/components/ui/Alert';
import { DetailRow, MobileCard } from '@/components/ui/MobileCard';

function formatDate(value: string, locale: string) {
  return new Date(value).toLocaleString(locale);
}

interface RegisteredStudentsListProps {
  refreshKey?: number;
}

export function RegisteredStudentsList({ refreshKey = 0 }: RegisteredStudentsListProps) {
  const locale = useLocale();
  const t = useTranslations('students');
  const tCommon = useTranslations('common');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await listStudents({ limit: 100 });
      setStudents(result.data);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('loadRegisteredError');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  if (loading) {
    return <p className="text-sm text-slate-500">{tCommon('loading')}</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900">{t('registeredListTitle')}</h3>
      {error && <Alert variant="error">{error}</Alert>}

      {students.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          {t('noRegistered')}
        </p>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {students.map((student) => (
              <MobileCard key={student.id}>
                <div className="space-y-3">
                  <p className="text-base font-semibold text-slate-900">
                    {formatStudentName(student)}
                  </p>
                  <div className="grid gap-3">
                    <DetailRow label={t('section')}>
                      {formatSectionValue(student.section, t)}
                    </DetailRow>
                    <DetailRow label={t('phoneNumbers')}>
                      {formatPhoneNumbers(student.phoneNumbers)}
                    </DetailRow>
                    <DetailRow label={t('cameViaWhat')}>
                      {formatCameViaValue(student.comeViaWho, t)}
                    </DetailRow>
                    <DetailRow label={t('guardianInfo')}>
                      {student.guardianInfo || t('noGuardianInfo')}
                    </DetailRow>
                    <DetailRow label={t('registeredBy')}>
                      {student.registeredBy
                        ? t('registeredByLine', {
                            name: formatStaffName(student.registeredBy),
                          })
                        : t('registeredAt', {
                            date: formatDate(
                              student.registeredAt ?? student.createdAt,
                              locale,
                            ),
                          })}
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
                    {t('registeredBy')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {students.map((student) => (
                  <tr key={student.id} className="align-top transition hover:bg-slate-50/80">
                    <td className="px-4 py-3.5 font-medium text-slate-900">
                      {formatStudentName(student)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {formatSectionValue(student.section, t)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {formatPhoneNumbers(student.phoneNumbers)}
                    </td>
                    <td className="max-w-xs px-4 py-3.5 text-slate-600">
                      {formatCameViaValue(student.comeViaWho, t)}
                    </td>
                    <td className="max-w-xs px-4 py-3.5 text-slate-600">
                      {student.guardianInfo || t('noGuardianInfo')}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {student.registeredBy
                        ? t('registeredByLine', {
                            name: formatStaffName(student.registeredBy),
                          })
                        : t('registeredAt', {
                            date: formatDate(
                              student.registeredAt ?? student.createdAt,
                              locale,
                            ),
                          })}
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
