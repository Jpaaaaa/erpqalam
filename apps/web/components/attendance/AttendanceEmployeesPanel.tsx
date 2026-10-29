'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ApiClientError,
  bulkImportAttendanceUsers,
  createAttendanceUser,
  getAttendanceSettings,
  listAttendanceRecords,
  listAttendanceUsers,
  updateAttendanceUser,
} from '@/lib/api/attendance';
import { parseEmployeeCsv } from '@/lib/attendance/csv-import';
import { parseWorkingDays } from '@/lib/attendance/report-days';
import type { AttendanceSettings, MergedAttendanceEmployee } from '@/lib/types/attendance';
import { useAuth } from '@/lib/auth/context';
import { canManageAttendance } from '@/lib/permissions';
import {
  buildNameLookup,
  mergeEmployeesWithPunchIds,
} from '@/lib/attendance/employees';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MobileCard } from '@/components/ui/MobileCard';
import { Modal } from '@/components/ui/Modal';

const DAY_KEYS = ['0', '1', '2', '3', '4', '5', '6'] as const;

function emptyToNull(value: string): string | null {
  return value.trim() ? value.trim() : null;
}

export function AttendanceEmployeesPanel() {
  const t = useTranslations('attendance.employees');
  const tSettings = useTranslations('attendance.settings');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const canManage = Boolean(
    user && canManageAttendance(user.role, user.permissions),
  );
  const [employees, setEmployees] = useState<MergedAttendanceEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<MergedAttendanceEmployee | null>(null);
  const [editName, setEditName] = useState('');
  const [globalSettings, setGlobalSettings] = useState<AttendanceSettings | null>(
    null,
  );
  const [useGlobalWorkingDays, setUseGlobalWorkingDays] = useState(true);
  const [workingDays, setWorkingDays] = useState<number[]>([]);
  const [shiftStart, setShiftStart] = useState('');
  const [shiftEnd, setShiftEnd] = useState('');
  const [entryZoneStart, setEntryZoneStart] = useState('');
  const [entryZoneEnd, setEntryZoneEnd] = useState('');
  const [exitZoneStart, setExitZoneStart] = useState('');
  const [exitZoneEnd, setExitZoneEnd] = useState('');
  const [lateZoneStart, setLateZoneStart] = useState('');
  const [lateZoneEnd, setLateZoneEnd] = useState('');
  const [earlyZoneStart, setEarlyZoneStart] = useState('');
  const [earlyZoneEnd, setEarlyZoneEnd] = useState('');
  const [saving, setSaving] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [importing, setImporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [users, records, settings] = await Promise.all([
        listAttendanceUsers(),
        listAttendanceRecords({ limit: 500 }),
        getAttendanceSettings(),
      ]);
      setEmployees(mergeEmployeesWithPunchIds(users, records));
      setGlobalSettings(settings);
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
    const parsedDays = parseWorkingDays(employee.workingDays);
    setUseGlobalWorkingDays(parsedDays == null);
    setWorkingDays(
      parsedDays ?? globalSettings?.workingDays ?? [0, 1, 2, 3, 4, 5],
    );
    setShiftStart(employee.shiftStartTime || '');
    setShiftEnd(employee.shiftEndTime || '');
    setEntryZoneStart(employee.entryZoneStart || '');
    setEntryZoneEnd(employee.entryZoneEnd || '');
    setExitZoneStart(employee.exitZoneStart || '');
    setExitZoneEnd(employee.exitZoneEnd || '');
    setLateZoneStart(employee.lateZoneStartTime || '');
    setLateZoneEnd(employee.lateZoneEndTime || '');
    setEarlyZoneStart(employee.earlyLeftZoneStartTime || '');
    setEarlyZoneEnd(employee.earlyLeftZoneEndTime || '');
    setSuccess('');
    setError('');
  }

  function toggleWorkingDay(day: number) {
    setWorkingDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return Array.from(next).sort((a, b) => a - b);
    });
  }

  function schedulePayload() {
    return {
      workingDays: useGlobalWorkingDays
        ? null
        : JSON.stringify(workingDays),
      shiftStartTime: emptyToNull(shiftStart),
      shiftEndTime: emptyToNull(shiftEnd),
      entryZoneStart: emptyToNull(entryZoneStart),
      entryZoneEnd: emptyToNull(entryZoneEnd),
      exitZoneStart: emptyToNull(exitZoneStart),
      exitZoneEnd: emptyToNull(exitZoneEnd),
      lateZoneStartTime: emptyToNull(lateZoneStart),
      lateZoneEndTime: emptyToNull(lateZoneEnd),
      earlyLeftZoneStartTime: emptyToNull(earlyZoneStart),
      earlyLeftZoneEndTime: emptyToNull(earlyZoneEnd),
    };
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
        await updateAttendanceUser(editing.deviceUserId, {
          name,
          ...schedulePayload(),
        });
      } else {
        await updateAttendanceUser(editing.deviceUserId, {
          name,
          ...schedulePayload(),
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
      {!canManage && <Alert variant="info">{t('viewOnly')}</Alert>}

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
          <Button
            type="submit"
            className="w-full sm:w-auto"
            isLoading={saving}
            disabled={!canManage}
          >
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
            disabled={importing || !canManage}
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
                  {canManage && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      onClick={() => openEdit(employee)}
                    >
                      {t('edit')}
                    </Button>
                  )}
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
                      {canManage && (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => openEdit(employee)}
                        >
                          {t('edit')}
                        </Button>
                      )}
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
            <Button
              type="submit"
              form="edit-employee-form"
              isLoading={saving}
              disabled={!canManage}
            >
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
            <p className="text-xs text-slate-500">{t('scheduleHint')}</p>
            <section className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <h4 className="text-sm font-semibold text-slate-800">
                {tSettings('workingDaysSection')}
              </h4>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={useGlobalWorkingDays}
                  onChange={(e) => setUseGlobalWorkingDays(e.target.checked)}
                  className="rounded border-slate-300"
                />
                {t('useGlobalWorkingDays')}
              </label>
              {!useGlobalWorkingDays && (
                <div className="flex flex-wrap gap-2">
                  {DAY_KEYS.map((key) => {
                    const day = Number(key);
                    const active = workingDays.includes(day);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleWorkingDay(day)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                          active
                            ? 'bg-teal-600 text-white'
                            : 'bg-white text-slate-600 ring-1 ring-slate-200'
                        }`}
                      >
                        {tSettings(`days.${key}` as 'days.0')}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
            <section className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-800">
                {tSettings('shiftSection')}
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={tSettings('shiftStart')}
                  type="time"
                  value={shiftStart}
                  placeholder={globalSettings?.shiftStartTime}
                  onChange={(e) => setShiftStart(e.target.value)}
                />
                <Input
                  label={tSettings('shiftEnd')}
                  type="time"
                  value={shiftEnd}
                  placeholder={globalSettings?.shiftEndTime}
                  onChange={(e) => setShiftEnd(e.target.value)}
                />
              </div>
            </section>
            <section className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-800">
                {tSettings('zonesSection')}
              </h4>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label={tSettings('entryStart')}
                  type="time"
                  value={entryZoneStart}
                  placeholder={globalSettings?.entryZoneStart}
                  onChange={(e) => setEntryZoneStart(e.target.value)}
                />
                <Input
                  label={tSettings('entryEnd')}
                  type="time"
                  value={entryZoneEnd}
                  placeholder={globalSettings?.entryZoneEnd}
                  onChange={(e) => setEntryZoneEnd(e.target.value)}
                />
                <Input
                  label={tSettings('lateStart')}
                  type="time"
                  value={lateZoneStart}
                  placeholder={globalSettings?.lateZoneStartTime}
                  onChange={(e) => setLateZoneStart(e.target.value)}
                />
                <Input
                  label={tSettings('lateEnd')}
                  type="time"
                  value={lateZoneEnd}
                  placeholder={globalSettings?.lateZoneEndTime}
                  onChange={(e) => setLateZoneEnd(e.target.value)}
                />
                <Input
                  label={tSettings('exitStart')}
                  type="time"
                  value={exitZoneStart}
                  placeholder={globalSettings?.exitZoneStart}
                  onChange={(e) => setExitZoneStart(e.target.value)}
                />
                <Input
                  label={tSettings('exitEnd')}
                  type="time"
                  value={exitZoneEnd}
                  placeholder={globalSettings?.exitZoneEnd}
                  onChange={(e) => setExitZoneEnd(e.target.value)}
                />
                <Input
                  label={tSettings('earlyStart')}
                  type="time"
                  value={earlyZoneStart}
                  placeholder={globalSettings?.earlyLeftZoneStartTime}
                  onChange={(e) => setEarlyZoneStart(e.target.value)}
                />
                <Input
                  label={tSettings('earlyEnd')}
                  type="time"
                  value={earlyZoneEnd}
                  placeholder={globalSettings?.earlyLeftZoneEndTime}
                  onChange={(e) => setEarlyZoneEnd(e.target.value)}
                />
              </div>
            </section>
          </form>
        )}
      </Modal>
    </div>
  );
}
