'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ApiClientError,
  downloadEmployeeReportPdf,
  getAttendanceSettings,
  getEmployeeReport,
  listAttendanceRecords,
  listAttendanceUsers,
  listEmployeeHolidays,
  listHolidays,
  listLeaveBalances,
} from '@/lib/api/attendance';
import type {
  AttendanceHoliday,
  AttendanceRecord,
  AttendanceSettings,
  AttendanceUser,
  DateFilter,
  EmployeeHoliday,
  EmployeeReportRow,
  LeaveBalance,
  PunchType,
} from '@/lib/types/attendance';
import { buildNameLookup } from '@/lib/attendance/employees';
import {
  formatDisplayDate,
  formatDisplayTime,
  getQuickRange,
} from '@/lib/attendance/formatters';
import { buildEmployeeDayRows } from '@/lib/attendance/report-days';
import { AttendanceDateFilterBar } from '@/components/attendance/AttendanceDateFilterBar';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { DetailRow, MobileCard } from '@/components/ui/MobileCard';
import { MetricCard } from '@/components/ui/MetricCard';
import { TabNav } from '@/components/ui/TabNav';

type ReportSubtab = 'performance' | 'per-employee' | 'summary';

export function EmployeeReportPanel() {
  const t = useTranslations('attendance.report');
  const tPunch = useTranslations('attendance.punchTypes');
  const tCommon = useTranslations('common');
  const [subtab, setSubtab] = useState<ReportSubtab>('performance');
  const [rows, setRows] = useState<EmployeeReportRow[]>([]);
  const [users, setUsers] = useState<AttendanceUser[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [settings, setSettings] = useState<AttendanceSettings | null>(null);
  const [holidays, setHolidays] = useState<AttendanceHoliday[]>([]);
  const [employeeHolidays, setEmployeeHolidays] = useState<EmployeeHoliday[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<DateFilter>(() => {
    const month = getQuickRange('month');
    return { fromDate: month.from, toDate: month.to };
  });
  const [employeeFilter, setEmployeeFilter] = useState<DateFilter>(() => {
    const month = getQuickRange('month');
    return { fromDate: month.from, toDate: month.to };
  });
  const [search, setSearch] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [employeeRecords, setEmployeeRecords] = useState<AttendanceRecord[]>(
    [],
  );
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const nameLookup = useMemo(
    () => buildNameLookup(users.map((user) => ({ ...user, isUnregistered: false }))),
    [users],
  );
  const balanceLookup = useMemo(
    () => new Map(balances.map((item) => [item.deviceUserId, item.balanceDays])),
    [balances],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [userRows, report, leaveRows, holidayRows, empHolidayRows, settingsRow] =
        await Promise.all([
          listAttendanceUsers(),
          getEmployeeReport({
            fromDate: filter.fromDate || undefined,
            toDate: filter.toDate || undefined,
          }),
          listLeaveBalances(),
          listHolidays(),
          listEmployeeHolidays(),
          getAttendanceSettings(),
        ]);
      setUsers(userRows);
      setRows(report.rows);
      setBalances(leaveRows);
      setHolidays(holidayRows);
      setEmployeeHolidays(empHolidayRows);
      setSettings(settingsRow);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [filter.fromDate, filter.toDate, t]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selectedEmployeeId) {
      setEmployeeRecords([]);
      return;
    }
    let cancelled = false;
    setEmployeeLoading(true);
    listAttendanceRecords({
      deviceUserId: selectedEmployeeId,
      fromDate: employeeFilter.fromDate || undefined,
      toDate: employeeFilter.toDate || undefined,
      limit: 5000,
    })
      .then((records) => {
        if (!cancelled) setEmployeeRecords(records);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : t('loadError'));
        }
      })
      .finally(() => {
        if (!cancelled) setEmployeeLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedEmployeeId, employeeFilter.fromDate, employeeFilter.toDate, t]);

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

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, row) => ({
        present: acc.present + row.workingDaysPresent,
        absent: acc.absent + row.daysAbsent,
        late: acc.late + row.lateCount,
        expected: acc.expected + row.expectedWorkingDays,
      }),
      { present: 0, absent: 0, late: 0, expected: 0 },
    );
  }, [filtered]);

  const attendanceRate =
    totals.expected > 0
      ? Math.round((totals.present / totals.expected) * 100)
      : 0;

  const selectedUser = users.find(
    (user) => user.deviceUserId === selectedEmployeeId,
  );
  const selectedRow = rows.find(
    (row) => row.deviceUserId === selectedEmployeeId,
  );
  const dayRows =
    selectedEmployeeId && settings
      ? buildEmployeeDayRows({
          deviceUserId: selectedEmployeeId,
          records: employeeRecords,
          user: selectedUser,
          settings,
          holidays,
          employeeHolidays,
          fromDate: employeeFilter.fromDate,
          toDate: employeeFilter.toDate,
        })
      : [];
  const notComingCount = dayRows.filter((day) => day.isNotComing).length;

  async function handleExportPdf() {
    if (subtab === 'per-employee' && !selectedEmployeeId) {
      setError(t('selectEmployeeFirst'));
      return;
    }
    setExporting(true);
    setError('');
    try {
      const range = subtab === 'per-employee' ? employeeFilter : filter;
      await downloadEmployeeReportPdf({
        type: subtab,
        fromDate: range.fromDate || undefined,
        toDate: range.toDate || undefined,
        deviceUserId:
          subtab === 'per-employee' ? selectedEmployeeId : undefined,
      });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('pdfError'));
    } finally {
      setExporting(false);
    }
  }

  function punchLabel(type?: PunchType | null) {
    if (!type) return '–';
    return tPunch(type);
  }

  return (
    <div className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TabNav
          items={[
            { key: 'performance', label: t('tabs.performance'), onClick: () => setSubtab('performance') },
            { key: 'per-employee', label: t('tabs.perEmployee'), onClick: () => setSubtab('per-employee') },
            { key: 'summary', label: t('tabs.summary'), onClick: () => setSubtab('summary') },
          ]}
          activeKey={subtab}
        />
        <Button
          type="button"
          className="w-full sm:w-auto"
          isLoading={exporting}
          loadingLabel={t('pdfExporting')}
          disabled={subtab === 'per-employee' && !selectedEmployeeId}
          onClick={() => void handleExportPdf()}
        >
          {t('generatePdf')}
        </Button>
      </div>

      {subtab !== 'per-employee' && (
        <>
          <AttendanceDateFilterBar filter={filter} onChange={setFilter} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </>
      )}

      {subtab === 'summary' && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard label={t('employeeCount')} value={filtered.length} tone="teal" />
          <MetricCard label={t('presentDays')} value={totals.present} tone="teal" />
          <MetricCard label={t('expectedDays')} value={totals.expected} tone="orange" />
          <MetricCard label={t('absentDays')} value={totals.absent} tone="coral" />
          <MetricCard label={t('lateEvents')} value={totals.late} tone="amber" />
          <MetricCard
            label={t('attendanceRate')}
            value={`${attendanceRate}%`}
            tone="orange"
            progress={attendanceRate}
          />
        </div>
      )}

      {subtab === 'per-employee' ? (
        <div className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium text-slate-700">{t('selectEmployee')}</span>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              >
                <option value="">{t('selectEmployeePlaceholder')}</option>
                {users.map((user) => (
                  <option key={user.deviceUserId} value={user.deviceUserId}>
                    {user.name || user.deviceUserId} ({user.deviceUserId})
                  </option>
                ))}
              </select>
            </label>
            <AttendanceDateFilterBar
              filter={employeeFilter}
              onChange={setEmployeeFilter}
            />
          </div>

          {!selectedEmployeeId ? (
            <p className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              {t('selectEmployeeHint')}
            </p>
          ) : employeeLoading || loading ? (
            <p className="text-sm text-slate-500">{tCommon('loading')}</p>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <MetricCard
                  label={t('present')}
                  value={selectedRow?.workingDaysPresent ?? 0}
                  tone="teal"
                />
                <MetricCard
                  label={t('expected')}
                  value={selectedRow?.expectedWorkingDays ?? 0}
                  tone="orange"
                />
                <MetricCard
                  label={t('absent')}
                  value={selectedRow?.daysAbsent ?? 0}
                  tone="coral"
                />
                <MetricCard
                  label={t('notComing')}
                  value={notComingCount}
                  tone="coral"
                  footer={t('notComingHint')}
                />
                <MetricCard
                  label={t('leaveBalance')}
                  value={balanceLookup.get(selectedEmployeeId) ?? 0}
                  tone="amber"
                />
              </div>

              {dayRows.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                  {t('emptyDays')}
                </p>
              ) : (
                <>
                  <div className="space-y-3 md:hidden">
                    {dayRows.map((day) => (
                      <MobileCard key={day.date}>
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-base font-semibold text-slate-900">
                              {formatDisplayDate(day.date)}
                            </p>
                            {day.isHoliday && (
                              <span className="rounded-lg bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                                {t('holiday')}
                              </span>
                            )}
                            {day.isNotComing && (
                              <span className="rounded-lg bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                                {t('didNotCome')}
                              </span>
                            )}
                          </div>
                          {!day.isHoliday && !day.isNotComing && (
                            <div className="grid grid-cols-2 gap-3">
                              <DetailRow label={t('entryTime')}>
                                {day.entryTime ? formatDisplayTime(day.entryTime) : '–'}
                              </DetailRow>
                              <DetailRow label={t('entryType')}>
                                {punchLabel(day.entryType)}
                              </DetailRow>
                              <DetailRow label={t('exitTime')}>
                                {day.exitTime ? formatDisplayTime(day.exitTime) : '–'}
                              </DetailRow>
                              <DetailRow label={t('exitType')}>
                                {punchLabel(day.exitType)}
                              </DetailRow>
                            </div>
                          )}
                        </div>
                      </MobileCard>
                    ))}
                  </div>

                  <div className="hidden overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-card md:block">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/80 text-start text-xs font-semibold uppercase tracking-wide text-slate-500">
                          <th className="px-4 py-3">{t('date')}</th>
                          <th className="px-4 py-3">{t('entryTime')}</th>
                          <th className="px-4 py-3">{t('entryType')}</th>
                          <th className="px-4 py-3">{t('exitTime')}</th>
                          <th className="px-4 py-3">{t('exitType')}</th>
                          <th className="px-4 py-3">{t('status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dayRows.map((day) => (
                          <tr
                            key={day.date}
                            className={`border-b border-slate-50 last:border-0 ${
                              day.isHoliday
                                ? 'bg-emerald-50/50'
                                : day.isNotComing
                                  ? 'bg-red-50/50'
                                  : ''
                            }`}
                          >
                            <td className="px-4 py-3 font-medium text-slate-800">
                              {formatDisplayDate(day.date)}
                            </td>
                            <td className="px-4 py-3">
                              {day.entryTime ? formatDisplayTime(day.entryTime) : '–'}
                            </td>
                            <td className="px-4 py-3">
                              {day.isHoliday
                                ? t('holiday')
                                : day.isNotComing
                                  ? t('didNotCome')
                                  : punchLabel(day.entryType)}
                            </td>
                            <td className="px-4 py-3">
                              {day.exitTime ? formatDisplayTime(day.exitTime) : '–'}
                            </td>
                            <td className="px-4 py-3">
                              {day.isHoliday
                                ? t('holiday')
                                : day.isNotComing
                                  ? t('didNotCome')
                                  : punchLabel(day.exitType)}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {day.isHoliday
                                ? t('holiday')
                                : day.isNotComing
                                  ? t('notComingHint')
                                  : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      ) : loading ? (
        <p className="text-sm text-slate-500">{tCommon('loading')}</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          {t('empty')}
        </p>
      ) : (
        <ComparisonList
          rows={filtered}
          nameLookup={nameLookup}
          balanceLookup={balanceLookup}
          t={t}
        />
      )}
    </div>
  );
}

function ComparisonList({
  rows,
  nameLookup,
  balanceLookup,
  t,
}: {
  rows: EmployeeReportRow[];
  nameLookup: Map<string, string>;
  balanceLookup: Map<string, number>;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <>
      <div className="space-y-3 md:hidden">
        {rows.map((row) => {
          const name = nameLookup.get(row.deviceUserId) || row.deviceUserId;
          return (
            <MobileCard key={row.deviceUserId}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{row.deviceUserId}</p>
                  </div>
                  <span className="rounded-lg bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">
                    {t('leaveBalance')}: {balanceLookup.get(row.deviceUserId) ?? 0}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <DetailRow label={t('present')}>{row.workingDaysPresent}</DetailRow>
                  <DetailRow label={t('expected')}>{row.expectedWorkingDays}</DetailRow>
                  <DetailRow label={t('absent')}>{row.daysAbsent}</DetailRow>
                  <DetailRow label={t('late')}>{row.lateCount}</DetailRow>
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
              <th className="px-4 py-3">{t('id')}</th>
              <th className="px-4 py-3">{t('employee')}</th>
              <th className="px-4 py-3">{t('present')}</th>
              <th className="px-4 py-3">{t('expected')}</th>
              <th className="px-4 py-3">{t('absent')}</th>
              <th className="px-4 py-3">{t('late')}</th>
              <th className="px-4 py-3">{t('leaveBalance')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const name = nameLookup.get(row.deviceUserId) || row.deviceUserId;
              return (
                <tr key={row.deviceUserId} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                      {row.deviceUserId}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                        {name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-800">{name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{row.workingDaysPresent}</td>
                  <td className="px-4 py-3">{row.expectedWorkingDays}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-lg px-2 py-1 text-xs font-medium ${
                        row.daysAbsent > 0
                          ? 'bg-red-50 text-red-700'
                          : 'bg-slate-50 text-slate-600'
                      }`}
                    >
                      {row.daysAbsent}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-lg px-2 py-1 text-xs font-medium ${
                        row.lateCount > 0
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-50 text-slate-600'
                      }`}
                    >
                      {row.lateCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700">
                      {balanceLookup.get(row.deviceUserId) ?? 0}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
