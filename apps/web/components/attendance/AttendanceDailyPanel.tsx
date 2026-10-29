'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ApiClientError,
  downloadEmployeeReportPdf,
  getDailyReport,
  listAttendanceUsers,
} from '@/lib/api/attendance';
import type { DailyAttendanceRow, DailyAttendanceSummary } from '@/lib/types/attendance';
import { buildNameLookup } from '@/lib/attendance/employees';
import {
  formatDisplayDate,
  formatDisplayTime,
  todayDateKey,
} from '@/lib/attendance/formatters';
import { DAILY_STATUS_TONE } from '@/lib/attendance/daily-status';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MetricCard } from '@/components/ui/MetricCard';
import { MobileCard } from '@/components/ui/MobileCard';

export function AttendanceDailyPanel() {
  const t = useTranslations('attendance.daily');
  const tPunch = useTranslations('attendance.punchTypes');
  const tCommon = useTranslations('common');
  const [date, setDate] = useState(todayDateKey());
  const [rows, setRows] = useState<DailyAttendanceRow[]>([]);
  const [summary, setSummary] = useState<DailyAttendanceSummary | null>(null);
  const [nameLookup, setNameLookup] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [report, users] = await Promise.all([
        getDailyReport(date),
        listAttendanceUsers(),
      ]);
      setRows(report.rows);
      setSummary(report.summary);
      setNameLookup(
        buildNameLookup(users.map((u) => ({ ...u, isUnregistered: false }))),
      );
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [date, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const name = nameLookup.get(row.deviceUserId) || row.deviceUserId;
      return (
        row.deviceUserId.toLowerCase().includes(q) ||
        name.toLowerCase().includes(q)
      );
    });
  }, [rows, search, nameLookup]);

  async function handleExportPdf() {
    setExporting(true);
    setError('');
    try {
      await downloadEmployeeReportPdf({
        type: 'daily',
        fromDate: date,
        toDate: date,
      });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('pdfError'));
    } finally {
      setExporting(false);
    }
  }

  function statusLabel(status: DailyAttendanceRow['status']) {
    return t(`status.${status}`);
  }

  function punchLabel(type?: DailyAttendanceRow['entryType']) {
    if (!type) return '–';
    return tPunch(type);
  }

  return (
    <div className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card sm:flex-row sm:items-end sm:justify-between">
        <Input
          label={t('pickDate')}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="sm:max-w-xs"
        />
        <Button
          type="button"
          className="w-full sm:w-auto"
          isLoading={exporting}
          loadingLabel={t('pdfExporting')}
          onClick={() => void handleExportPdf()}
        >
          {t('exportPdf')}
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">{tCommon('loading')}</p>
      ) : summary ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label={t('summary.present')} value={summary.present} tone="teal" />
            <MetricCard label={t('summary.late')} value={summary.late} tone="amber" />
            <MetricCard label={t('summary.absent')} value={summary.absent} tone="coral" />
            <MetricCard label={t('summary.onLeave')} value={summary.onLeave} tone="orange" />
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
                {filtered.map((row) => {
                  const name = nameLookup.get(row.deviceUserId) || row.deviceUserId;
                  const tone = DAILY_STATUS_TONE[row.status];
                  return (
                    <MobileCard key={row.deviceUserId}>
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-base font-semibold text-slate-900">{name}</p>
                            <p className="text-xs text-slate-500">{row.deviceUserId}</p>
                          </div>
                          <span className={`rounded-lg px-2 py-1 text-xs font-medium ${tone.badge}`}>
                            {statusLabel(row.status)}
                          </span>
                        </div>
                        {(row.entryTime || row.exitTime) && (
                          <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
                            <div>
                              <span className="text-xs text-slate-500">{t('entry')}</span>
                              <p>{row.entryTime ? formatDisplayTime(row.entryTime) : '–'}</p>
                              <p className="text-xs">{punchLabel(row.entryType)}</p>
                            </div>
                            <div>
                              <span className="text-xs text-slate-500">{t('exit')}</span>
                              <p>{row.exitTime ? formatDisplayTime(row.exitTime) : '–'}</p>
                              <p className="text-xs">{punchLabel(row.exitType)}</p>
                            </div>
                          </div>
                        )}
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
                      <th className="px-4 py-3">{t('id')}</th>
                      <th className="px-4 py-3">{t('statusLabel')}</th>
                      <th className="px-4 py-3">{t('entry')}</th>
                      <th className="px-4 py-3">{t('entryType')}</th>
                      <th className="px-4 py-3">{t('exit')}</th>
                      <th className="px-4 py-3">{t('exitType')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => {
                      const name = nameLookup.get(row.deviceUserId) || row.deviceUserId;
                      const tone = DAILY_STATUS_TONE[row.status];
                      const inactive =
                        row.status === 'absent' ||
                        row.status === 'on_leave' ||
                        row.status === 'official_holiday' ||
                        row.status === 'day_off';
                      return (
                        <tr
                          key={row.deviceUserId}
                          className={`border-b border-slate-50 last:border-0 ${tone.row}`}
                        >
                          <td className="px-4 py-3 font-medium text-slate-800">{name}</td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">
                            {row.deviceUserId}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-lg px-2 py-1 text-xs font-medium ${tone.badge}`}>
                              {statusLabel(row.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {inactive || !row.entryTime
                              ? '–'
                              : formatDisplayTime(row.entryTime)}
                          </td>
                          <td className="px-4 py-3">
                            {inactive ? '–' : punchLabel(row.entryType)}
                          </td>
                          <td className="px-4 py-3">
                            {inactive || !row.exitTime
                              ? '–'
                              : formatDisplayTime(row.exitTime)}
                          </td>
                          <td className="px-4 py-3">
                            {inactive ? '–' : punchLabel(row.exitType)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <p className="text-xs text-slate-500">
            {t('dateHeading', { date: formatDisplayDate(date) })}
          </p>
        </>
      ) : null}
    </div>
  );
}
