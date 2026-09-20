'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { StudentAuditLogEntry } from '@/lib/types/student-audit';
import { STUDENT_AUDIT_CREATED_FIELD } from '@/lib/types/student-audit';
import {
  formatStudentAuditFieldValue,
  getStudentAuditFieldLabel,
} from '@/lib/students/audit-labels';
import { Modal } from '@/components/ui/Modal';

function formatAuditDate(value: string, locale: string) {
  return new Date(value).toLocaleString(locale);
}

function isEnrollmentEntry(entry: StudentAuditLogEntry): boolean {
  return (
    entry.action === 'CREATE' ||
    entry.changes.some((change) => change.field === STUDENT_AUDIT_CREATED_FIELD)
  );
}

interface StudentAuditHistoryModalProps {
  open: boolean;
  entries: StudentAuditLogEntry[];
  onClose: () => void;
}

export function StudentAuditHistoryModal({
  open,
  entries,
  onClose,
}: StudentAuditHistoryModalProps) {
  const locale = useLocale();
  const t = useTranslations('students.audit');
  const tStudents = useTranslations('students');
  const tDetails = useTranslations('students.detailsForm');

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('historyTitle')}
      size="lg"
      overlayClassName="z-[60]"
      panelClassName="z-[61]"
    >
      {entries.length === 0 ? (
        <p className="text-sm text-slate-600">{t('empty')}</p>
      ) : (
        <ul className="space-y-6">
          {entries.map((entry) => {
            const enrolled = isEnrollmentEntry(entry);
            const summaryKey = enrolled ? 'enrolledBy' : 'updatedBy';

            return (
              <li
                key={entry.id}
                className="border-b border-slate-100 pb-6 last:border-b-0 last:pb-0"
              >
                <p className="text-sm font-medium text-slate-900">
                  {t(summaryKey, {
                    name: entry.changedByName,
                    date: formatAuditDate(entry.createdAt, locale),
                  })}
                </p>

                {!enrolled && entry.changes.length > 0 && (
                  <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-3 py-2 text-start font-medium text-slate-700">
                            {t('columnField')}
                          </th>
                          <th className="px-3 py-2 text-start font-medium text-slate-700">
                            {t('columnOld')}
                          </th>
                          <th className="px-3 py-2 text-start font-medium text-slate-700">
                            {t('columnNew')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {entry.changes.map((change, index) => (
                          <tr key={`${entry.id}-${change.field}-${index}`}>
                            <td className="px-3 py-2 text-slate-900">
                              {getStudentAuditFieldLabel(
                                change.field,
                                tStudents,
                                tDetails,
                              )}
                            </td>
                            <td className="px-3 py-2 text-slate-600">
                              {formatStudentAuditFieldValue(
                                change.field,
                                change.old,
                                tStudents,
                              )}
                            </td>
                            <td className="px-3 py-2 text-slate-900">
                              {formatStudentAuditFieldValue(
                                change.field,
                                change.new,
                                tStudents,
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
