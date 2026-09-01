'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ApiClientError,
  addManualPunch,
  listAttendanceDevices,
  listAttendanceRecords,
  listAttendanceUsers,
} from '@/lib/api/attendance';
import type { AttendanceRecord, DateFilter, PunchType } from '@/lib/types/attendance';
import {
  buildLocalTimestamp,
  formatDisplayDate,
  formatDisplayTime,
  todayDateKey,
} from '@/lib/attendance/formatters';
import {
  buildNameLookup,
  mergeEmployeesWithPunchIds,
} from '@/lib/attendance/employees';
import { buildDeviceNameLookup, getDeviceDisplayName } from '@/lib/attendance/devices';
import { PUNCH_TYPE_TONE } from '@/lib/attendance/punch-styles';
import { AttendanceDateFilterBar } from '@/components/attendance/AttendanceDateFilterBar';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DetailRow, MobileCard } from '@/components/ui/MobileCard';
import { Modal } from '@/components/ui/Modal';

export function AttendanceRecordsPanel() {
  const t = useTranslations('attendance.records');
  const tPunch = useTranslations('attendance.punchTypes');
  const tCommon = useTranslations('common');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState<DateFilter>({
    fromDate: todayDateKey(),
    toDate: todayDateKey(),
  });
  const [search, setSearch] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [manualUserId, setManualUserId] = useState('');
  const [manualDate, setManualDate] = useState(todayDateKey());
  const [manualTime, setManualTime] = useState('08:00');
  const [manualKind, setManualKind] = useState<'in' | 'out'>('in');
  const [submitting, setSubmitting] = useState(false);
  const [employeeOptions, setEmployeeOptions] = useState<
    { id: string; label: string }[]
  >([]);
  const [nameLookup, setNameLookup] = useState<Map<string, string>>(new Map());
  const [deviceNameLookup, setDeviceNameLookup] = useState<Map<string, string>>(
    new Map(),
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [users, devices, rows] = await Promise.all([
        listAttendanceUsers(),
        listAttendanceDevices(),
        listAttendanceRecords({
          fromDate: filter.fromDate || undefined,
          toDate: filter.toDate || undefined,
          limit: 500,
        }),
      ]);
      const merged = mergeEmployeesWithPunchIds(users, rows);
      const lookup = buildNameLookup(merged);
      setNameLookup(lookup);
      setDeviceNameLookup(buildDeviceNameLookup(devices));
      setEmployeeOptions(
        merged.map((e) => ({
          id: e.deviceUserId,
          label: `${lookup.get(e.deviceUserId)} (${e.deviceUserId})`,
        })),
      );
      setRecords(rows);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [filter.fromDate, filter.toDate, t]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) => {
      const name = nameLookup.get(r.deviceUserId) || r.deviceUserId;
      return (
        r.deviceUserId.toLowerCase().includes(q) ||
        name.toLowerCase().includes(q)
      );
    });
  }, [records, search, nameLookup]);

  async function handleManualPunch(e: React.FormEvent) {
    e.preventDefault();
    if (!manualUserId.trim()) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      await addManualPunch({
        deviceUserId: manualUserId.trim(),
        timestamp: buildLocalTimestamp(manualDate, manualTime),
        punchKind: manualKind,
      });
      setSuccess(t('manualSuccess'));
      setShowManual(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('manualError'));
    } finally {
      setSubmitting(false);
    }
  }

  function punchLabel(type?: PunchType | null) {
    if (!type) return tPunch('unknown');
    return tPunch(type);
  }

  function getRecordView(record: AttendanceRecord) {
    const punchType = record.punchType as PunchType | null | undefined;
    const styles = punchType
      ? PUNCH_TYPE_TONE[punchType]
      : PUNCH_TYPE_TONE.out_of_shift;
    const displayName = nameLookup.get(record.deviceUserId) || record.deviceUserId;
    const deviceLabel = getDeviceDisplayName(record.deviceSerial, deviceNameLookup);
    return {
      punchType,
      styles,
      displayName,
      showId: displayName !== record.deviceUserId,
      deviceLabel,
      showSerial: deviceLabel !== record.deviceSerial,
    };
  }

  return (
    <div className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <AttendanceDateFilterBar filter={filter} onChange={setFilter} />

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0 w-full flex-1">
          <Input
            label={t('search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
          />
        </div>
        <Button
          type="button"
          className="w-full sm:w-auto"
          onClick={() => setShowManual(true)}
        >
          {t('addManual')}
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">{tCommon('loading')}</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          {t('empty')}
        </p>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filtered.map((record) => {
              const view = getRecordView(record);
              return (
                <MobileCard key={record.id}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-base font-semibold text-slate-900">
                          {view.displayName}
                        </p>
                        {view.showId && (
                          <p className="mt-0.5 text-xs text-slate-500">
                            {record.deviceUserId}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-lg px-2 py-1 text-xs font-medium ${view.styles.badge}`}
                      >
                        {punchLabel(view.punchType)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <DetailRow label={t('date')}>
                        {formatDisplayDate(record.timestamp.slice(0, 10))}
                      </DetailRow>
                      <DetailRow label={t('time')}>
                        {formatDisplayTime(record.timestamp)}
                      </DetailRow>
                      <DetailRow label={t('verify')}>{record.verifyType}</DetailRow>
                      <DetailRow label={t('device')}>
                        <div>{view.deviceLabel}</div>
                        {view.showSerial && (
                          <div className="text-xs text-slate-500">
                            {record.deviceSerial}
                          </div>
                        )}
                      </DetailRow>
                    </div>
                  </div>
                </MobileCard>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-card md:block">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">{t('employee')}</th>
                  <th className="px-4 py-3">{t('date')}</th>
                  <th className="px-4 py-3">{t('time')}</th>
                  <th className="px-4 py-3">{t('type')}</th>
                  <th className="px-4 py-3">{t('verify')}</th>
                  <th className="px-4 py-3">{t('device')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => {
                  const view = getRecordView(record);
                  return (
                    <tr
                      key={record.id}
                      className={`border-b border-slate-50 last:border-0 ${view.styles.row}`}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{view.displayName}</div>
                        {view.showId && (
                          <div className="text-xs text-slate-500">{record.deviceUserId}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {formatDisplayDate(record.timestamp.slice(0, 10))}
                      </td>
                      <td className="px-4 py-3">{formatDisplayTime(record.timestamp)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-lg px-2 py-1 text-xs font-medium ${view.styles.badge}`}
                        >
                          {punchLabel(view.punchType)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{record.verifyType}</td>
                      <td className="px-4 py-3">
                        <div className="text-slate-700">{view.deviceLabel}</div>
                        {view.showSerial && (
                          <div className="text-xs text-slate-500">{record.deviceSerial}</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal
        open={showManual}
        onClose={() => setShowManual(false)}
        title={t('manualTitle')}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setShowManual(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" form="manual-punch-form" isLoading={submitting}>
              {t('saveManual')}
            </Button>
          </>
        }
      >
        <form id="manual-punch-form" onSubmit={handleManualPunch} className="space-y-4">
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-slate-700">{t('employee')}</span>
            <select
              value={manualUserId}
              onChange={(e) => setManualUserId(e.target.value)}
              required
              className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="">{t('selectEmployee')}</option>
              {employeeOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <Input
            label={t('date')}
            type="date"
            value={manualDate}
            onChange={(e) => setManualDate(e.target.value)}
            required
          />
          <Input
            label={t('time')}
            type="time"
            value={manualTime}
            onChange={(e) => setManualTime(e.target.value)}
            required
          />
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-slate-700">{t('punchKind')}</span>
            <select
              value={manualKind}
              onChange={(e) => setManualKind(e.target.value as 'in' | 'out')}
              className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="in">{t('punchIn')}</option>
              <option value="out">{t('punchOut')}</option>
            </select>
          </label>
        </form>
      </Modal>
    </div>
  );
}
