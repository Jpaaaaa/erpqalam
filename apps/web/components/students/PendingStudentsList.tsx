'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ApiClientError, listStudents, registerStudent } from '@/lib/api/students';
import { formatStudentName } from '@/lib/students/format';
import type { Student } from '@/lib/types/student';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

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
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await listStudents({ status: 'PENDING', limit: 100 });
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

  async function handleRegister(id: string) {
    setActionId(id);
    setError('');
    try {
      await registerStudent(id);
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
        <p className="text-sm text-slate-600">{t('noPending')}</p>
      ) : (
        <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {students.map((student) => (
            <li
              key={student.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">
                  {formatStudentName(student)}
                </p>
                {student.mobilePrimary && (
                  <p className="text-xs text-slate-600">
                    {student.mobilePrimary}
                    {student.mobileSecondary ? ` · ${student.mobileSecondary}` : ''}
                  </p>
                )}
                {student.comeViaWho && (
                  <p className="text-xs text-slate-600">
                    {t('comeViaWho')}: {student.comeViaWho}
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  {t('submittedAt', {
                    date: formatDate(student.createdAt, locale),
                  })}
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                isLoading={actionId === student.id}
                loadingLabel={tCommon('pleaseWait')}
                onClick={() => handleRegister(student.id)}
              >
                {t('markRegistered')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
