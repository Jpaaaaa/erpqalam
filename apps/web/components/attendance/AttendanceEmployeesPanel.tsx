'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ApiClientError,
  bulkImportAttendanceUsers,
  createAttendanceUser,
  listAttendanceRecords,
  listAttendanceUsers,
  updateAttendanceUser,
} from '@/lib/api/attendance';
import { parseEmployeeCsv } from '@/lib/attendance/csv-import';
import type { MergedAttendanceEmployee } from '@/lib/types/attendance';
import {
  buildNameLookup,
  mergeEmployeesWithPunchIds,
} from '@/lib/attendance/employees';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MobileCard } from '@/components/ui/MobileCard';
import { Modal } from '@/components/ui/Modal';

export function AttendanceEmployeesPanel() {
  const t = useTranslations('attendance.employees');
  const tCommon = useTranslations('common');
  const [employees, setEmployees] = useState<MergedAttendanceEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<MergedAttendanceEmployee | null>(null);
  const [editName, setEditName] = useState('');
  const [customSchedule, setCustomSchedule] = useState(false);
  const [shiftStart, setShiftStart] = useState('');
  const [shiftEnd, setShiftEnd] = useState('');
  const [saving, setSaving] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [importing, setImporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [users, records] = await Promise.all([
        listAttendanceUsers(),
        listAttendanceRecords({ limit: 500 }),
      ]);
      setEmployees(mergeEmployeesWithPunchIds(users, records));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.deviceUserId.toLowerCase().includes(q) ||
        (e.name || '').toLowerCase().includes(q),
    );
  }, [employees, search]);

  function openEdit(employee: MergedAttendanceEmployee) {
    setEditing(employee);
    setEditName(employee.name);
    const hasSchedule =
      Boolean(employee.shiftStartTime?.trim()) ||
      Boolean(employee.shiftEndTime?.trim());
    setCustomSchedule(hasSchedule);
    setShiftStart(employee.shiftStartTime || '');
    setShiftEnd(employee.shiftEndTime || '');
    setSuccess('');
    setError('');
  }

  async function saveEmployee(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const name = editName.trim();
      if (editing.isUnregistered) {
        await createAttendanceUser({
          deviceUserId: editing.deviceUserId,
          name,
        });
        if (customSchedule) {
          await updateAttendanceUser(editing.deviceUserId, {
            name,
            shiftStartTime: shiftStart || null,
            shiftEndTime: shiftEnd || null,
          });
        }
      } else {
        await updateAttendanceUser(editing.deviceUserId, {
          name,
          shiftStartTime: customSchedule ? shiftStart || null : null,
          shiftEndTime: customSchedule ? shiftEnd || null : null,
        });
      }
      setSuccess(t('saved'));
      setEditing(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const id = newUserId.trim();
    if (!id) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await createAttendanceUser({ deviceUserId: id, name: newUserName.trim() });
      setNewUserId('');
      setNewUserName('');
      setSuccess(t('created'));
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleCsvImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setImporting(true);
    setError('');
    setSuccess('');
    try {
      const text = await file.text();
      const users = parseEmployeeCsv(text);
      if (users.length === 0) {
        setError(t('importEmpty'));
        return;
      }
      const result = await bulkImportAttendanceUsers(users);
      setSuccess(
        t('importSuccess', {
          created: result.created,
          updated: result.updated,
          skipped: result.skipped,
        }),
      );
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('importError'));
    } finally {
      setImporting(false);
    }
  }

  const nameLookup = buildNameLookup(employees);

  if (loading) {
    return <p className="text-sm text-slate-500">{tCommon('loading')}</p>;
  }

  return (
    <div className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <form
        onSubmit={handleCreate}
        className="grid gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card sm:grid-cols-[1fr_1fr_auto]"
      >
        <Input
          label={t('deviceUserId')}
          value={newUserId}
          onChange={(e) => setNewUserId(e.target.value)}
        />
        <Input
          label={t('name')}
          value={newUserName}
          onChange={(e) => setNewUserName(e.target.value)}
        />
        <div className="flex items-end">
          <Button type="submit" className="w-full sm:w-auto" isLoading={saving}>
            {t('addEmployee')}
          </Button>
        </div>
      </form>

      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-5">
        <p className="mb-3 text-sm text-slate-600">{t('importHint')}</p>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-teal-700 hover:text-teal-800">
          <input
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            className="sr-only"
            disabled={importing}
            onChange={handleCsvImport}
          />
          <span className="rounded-xl border border-teal-200 bg-white px-4 py-2 shadow-sm">
            {importing ? tCommon('loading') : t('importCsv')}
          </span>
        </label>
      </div>

      <Input
        label={t('search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('searchPlaceholder')}
      />

      {filtered.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          {t('empty')}
        </p>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filtered.map((employee) => (
              <MobileCard key={employee.deviceUserId}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {nameLookup.get(employee.deviceUserId)}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-slate-500">
                        {employee.deviceUserId}
                      </p>
                    </div>
                    {employee.isUnregistered ? (
                      <span className="shrink-0 rounded-lg bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                        {t('unregistered')}
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-lg bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                        {t('registered')}
                      </span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => openEdit(employee)}
                  >
                    {t('edit')}
                  </Button>
                </div>
              </MobileCard>
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-card md:block">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">{t('deviceUserId')}</th>
                  <th className="px-4 py-3">{t('name')}</th>
                  <th className="px-4 py-3">{t('status')}</th>
                  <th className="px-4 py-3">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((employee) => (
                  <tr
                    key={employee.deviceUserId}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="px-4 py-3 font-mono text-slate-800">
                      {employee.deviceUserId}
                    </td>
                    <td className="px-4 py-3">
                      {nameLookup.get(employee.deviceUserId)}
                    </td>
                    <td className="px-4 py-3">
                      {employee.isUnregistered ? (
                        <span className="rounded-lg bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                          {t('unregistered')}
                        </span>
                      ) : (
                        <span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                          {t('registered')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => openEdit(employee)}
                      >
                        {t('edit')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={t('editTitle')}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setEditing(null)}>
              {t('cancel')}
            </Button>
            <Button type="submit" form="edit-employee-form" isLoading={saving}>
              {t('save')}
            </Button>
          </>
        }
      >
        {editing && (
          <form id="edit-employee-form" onSubmit={saveEmployee} className="space-y-4">
            <p className="text-sm text-slate-600">
              {t('deviceUserId')}: <strong>{editing.deviceUserId}</strong>
            </p>
            <Input
              label={t('name')}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={customSchedule}
                onChange={(e) => setCustomSchedule(e.target.checked)}
                className="rounded border-slate-300"
              />
              {t('customSchedule')}
            </label>
            {customSchedule && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={t('shiftStart')}
                  type="time"
                  value={shiftStart}
                  onChange={(e) => setShiftStart(e.target.value)}
                />
                <Input
                  label={t('shiftEnd')}
                  type="time"
                  value={shiftEnd}
                  onChange={(e) => setShiftEnd(e.target.value)}
                />
              </div>
            )}
          </form>
        )}
      </Modal>
    </div>
  );
}
