'use client';

import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  ApiClientError,
  approvePendingStudent,
  deletePendingStudent,
  getStudentCounts,
  listPendingStudents,
} from '@/lib/api/students';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import {
  emptyPendingStudentFilters,
  hasActivePendingFilters,
  pendingFiltersToQueryParams,
  type PendingStudentFilters,
} from '@/lib/students/pending-filters';
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
import { Input } from '@/components/ui/Input';
import { DetailRow, MobileCard } from '@/components/ui/MobileCard';
import { PendingStudentEditModal } from '@/components/students/PendingStudentEditModal';
import { PendingStudentRowActions } from '@/components/students/PendingStudentRowActions';
import { PendingStudentsAdvancedFilters } from '@/components/students/PendingStudentsAdvancedFilters';
import { StudentDetailsModal } from '@/components/students/StudentDetailsModal';
import { StudentsFilterToggle } from '@/components/students/StudentsListFilters';
import { CloseIcon } from '@/components/students/StudentListActionIcons';

const PAGE_SIZE = 25;

function formatDate(value: string, locale: string) {
  return new Date(value).toLocaleString(locale);
}

interface PendingStudentsListProps {
  refreshKey?: number;
  onAdd?: () => void;
}

export function PendingStudentsList({
  refreshKey = 0,
  onAdd,
}: PendingStudentsListProps) {
  const locale = useLocale();
  const t = useTranslations('students');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const [students, setStudents] = useState<PendingStudent[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pendingCount, setPendingCount] = useState(0);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<PendingStudentFilters>(
    emptyPendingStudentFilters(),
  );
  const [appliedFilters, setAppliedFilters] = useState<PendingStudentFilters>(
    emptyPendingStudentFilters(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<PendingStudent | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<PendingStudent | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const search = debouncedSearch.trim();
      const [result, counts] = await Promise.all([
        listPendingStudents({
          page,
          limit: PAGE_SIZE,
          search,
          ...appliedFilters,
        }),
        getStudentCounts(),
      ]);
      setStudents(result.data);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setPendingCount(counts.pending);
      setRegisteredCount(counts.registered);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('loadError');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, debouncedSearch, page, t]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const activeFilterCount = Object.keys(
    pendingFiltersToQueryParams(appliedFilters),
  ).length;
  const hasSearch = Boolean(debouncedSearch.trim());
  const hasFilters = hasSearch || hasActivePendingFilters(appliedFilters);
  const emptyMessage = hasFilters ? t('filters.noResults') : t('noPending');

  function handleSearchChange(value: string) {
    setSearchInput(value);
    setPage(1);
  }

  function handleApplyFilters() {
    setAppliedFilters({ ...draftFilters });
    setPage(1);
  }

  function handleClearFilters() {
    const empty = emptyPendingStudentFilters();
    setDraftFilters(empty);
    setAppliedFilters(empty);
    setPage(1);
  }

  async function handleApprove(id: string) {
    setActionId(`approve:${id}`);
    setError('');
    try {
      await approvePendingStudent(id);
      await load();
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
      if (editTarget?.id === id) setEditTarget(null);
      if (detailsTarget?.id === id) setDetailsTarget(null);
      await load();
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{t('pendingListTitle')}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
              {t('pendingCount', { count: pendingCount })}
            </span>
            <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              {t('registeredCount', { count: registeredCount })}
            </span>
          </div>
        </div>
        {onAdd && (
          <Button type="button" onClick={onAdd}>
            {t('pendingFormTitle')}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="relative min-w-0 flex-1">
          <Input
            label={t('searchPending')}
            name="pending-search"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t('searchPendingPlaceholder')}
            className="pe-10"
            autoComplete="off"
          />
          {searchInput ? (
            <button
              type="button"
              className="absolute end-2 top-9 inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              onClick={() => handleSearchChange('')}
              aria-label={t('clearSearch')}
              title={t('clearSearch')}
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:pb-0.5">
          {hasFilters && !loading && (
            <span className="text-xs font-medium text-slate-500">
              {t('filters.matchingCount', { count: total })}
            </span>
          )}
          <StudentsFilterToggle
            open={filtersOpen}
            activeCount={activeFilterCount}
            onToggle={() => setFiltersOpen((open) => !open)}
          />
        </div>
      </div>

      <PendingStudentsAdvancedFilters
        open={filtersOpen}
        filters={draftFilters}
        onChange={setDraftFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

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

      {loading ? (
        <PendingListSkeleton />
      ) : students.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          {emptyMessage}
        </p>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {students.map((student, index) => {
              const canApprove =
                Boolean(student.section?.trim()) && student.phoneNumbers.length === 2;
              const busy = actionId?.endsWith(`:${student.id}`) ?? false;
              const rowNumber = (page - 1) * PAGE_SIZE + index + 1;

              return (
                <MobileCard key={student.id}>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-400">#{rowNumber}</p>
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

          <div className="hidden overflow-x-auto rounded-2xl bg-slate-50/50 shadow-sm md:block">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="w-12 px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {t('rowNumber')}
                  </th>
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
                {students.map((student, index) => {
                  const canApprove =
                    Boolean(student.section?.trim()) && student.phoneNumbers.length === 2;
                  const busy = actionId?.endsWith(`:${student.id}`) ?? false;
                  const rowNumber = (page - 1) * PAGE_SIZE + index + 1;

                  return (
                    <tr key={student.id} className="align-top transition hover:bg-slate-50/80">
                      <td className="px-4 py-3.5 text-slate-400">{rowNumber}</td>
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

          {totalPages > 1 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                {t('prevPage')}
              </Button>
              <span className="text-center text-sm text-slate-500">
                {t('pageOf', { page, totalPages })}
              </span>
              <Button
                type="button"
                variant="secondary"
                className="w-full sm:w-auto"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t('nextPage')}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PendingListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="space-y-3 md:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-2xl bg-slate-50 p-4">
            <div className="h-4 w-1/3 rounded bg-slate-200" />
            <div className="mt-3 h-3 w-2/3 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-2xl bg-slate-50/50 md:block">
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex animate-pulse gap-4 px-4 py-3.5">
              <div className="h-4 w-8 rounded bg-slate-200" />
              <div className="h-4 w-40 rounded bg-slate-200" />
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-4 flex-1 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
