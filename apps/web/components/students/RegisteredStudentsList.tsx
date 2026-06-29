'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ApiClientError, listStudents } from '@/lib/api/students';
import {
  formatRegistrarName,
  formatStudentName,
} from '@/lib/students/format';
import type { Student } from '@/lib/types/student';
import { Alert } from '@/components/ui/Alert';

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
      const result = await listStudents({ status: 'REGISTERED', limit: 100 });
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
        <p className="text-sm text-slate-600">{t('noRegistered')}</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {students.map((student) => (
            <li key={student.id} className="space-y-1 px-4 py-3">
              <p className="font-medium text-slate-900">
                {formatStudentName(student)}
              </p>
              {student.mobilePrimary && (
                <p className="text-xs text-slate-600">
                  {t('mobilePrimary')}: {student.mobilePrimary}
                  {student.mobileSecondary
                    ? ` · ${t('mobileSecondary')}: ${student.mobileSecondary}`
                    : ''}
                </p>
              )}
              {student.comeViaWho && (
                <p className="text-xs text-slate-600">
                  {t('comeViaWho')}: {student.comeViaWho}
                </p>
              )}
              <p className="text-xs text-slate-500">
                {student.registeredBy
                  ? t('registeredByLine', {
                      name: formatRegistrarName(student.registeredBy),
                    })
                  : t('registeredAt', {
                      date: formatDate(
                        student.registeredAt ?? student.createdAt,
                        locale,
                      ),
                    })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
