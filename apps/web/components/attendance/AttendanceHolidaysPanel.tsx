'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ApiClientError,
  addEmployeeHoliday,
  addEmployeeHolidayRange,
  addHoliday,
  addHolidayRange,
  addTimeLeaveUsage,
  getAttendanceSettings,
  getEmployeeReport,
  listAttendanceRecords,
  listAttendanceUsers,
  listEmployeeHolidays,
  listHolidays,
  listLeaveBalances,
  listTimeLeaveUsage,
  removeEmployeeHoliday,
  removeHoliday,
  removeTimeLeaveUsage,
  setLeaveBalance,
  updateAttendanceSettings,
} from '@/lib/api/attendance';
import type {
  AttendanceHoliday,
  AttendanceHolidayType,
  AttendanceRecord,
  AttendanceSettings,
  AttendanceUser,
  DateFilter,
  EmployeeHoliday,
  LeaveBalance,
  TimeLeaveUsage,
} from '@/lib/types/attendance';
import { buildNameLookup } from '@/lib/attendance/employees';
import { formatDisplayDate, getQuickRange } from '@/lib/attendance/formatters';
import { useAuth } from '@/lib/auth/context';
import { canManageAttendance } from '@/lib/permissions';
import { AttendanceDateFilterBar } from '@/components/attendance/AttendanceDateFilterBar';
import { TimeLeaveCoverSection } from '@/components/attendance/TimeLeaveCoverSection';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TabNav } from '@/components/ui/TabNav';

type HolidaysSubtab = 'employee' | 'official' | 'temporary' | 'settings';

export function AttendanceHolidaysPanel() {
  const t = useTranslations('attendance.holidays');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const canManage = Boolean(
    user && canManageAttendance(user.role, user.permissions),
  );

  const [subtab, setSubtab] = useState<HolidaysSubtab>('employee');
  const [holidays, setHolidays] = useState<AttendanceHoliday[]>([]);
  const [employeeHolidays, setEmployeeHolidays] = useState<EmployeeHoliday[]>([]);
  const [timeLeave, setTimeLeave] = useState<TimeLeaveUsage[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [users, setUsers] = useState<AttendanceUser[]>([]);
  const [settings, setSettings] = useState<AttendanceSettings | null>(null);
  const [lateOccurrences, setLateOccurrences] = useState<
    { deviceUserId: string; date: string }[]
  >([]);
  const [earlyExitOccurrences, setEarlyExitOccurrences] = useState<
    { deviceUserId: string; date: string; timestamp: string }[]
  >([]);
  const [coverRecords, setCoverRecords] = useState<AttendanceRecord[]>([]);
  const [coverFilter, setCoverFilter] = useState<DateFilter>(() => {
    const month = getQuickRange('month');
    return { fromDate: month.from, toDate: month.to };
  });

  const [annualDays, setAnnualDays] = useState(7);
  const [tempRatio, setTempRatio] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [empUserId, setEmpUserId] = useState('');
  const [empDateFrom, setEmpDateFrom] = useState('');
  const [empDateTo, setEmpDateTo] = useState('');

  const [balanceUserId, setBalanceUserId] = useState('');
  const [balanceDays, setBalanceDays] = useState('7');

  const nameLookup = useMemo(
    () => buildNameLookup(users.map((u) => ({ ...u, isUnregistered: false }))),
    [users],
  );

  const loadCore = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [h, eh, tl, bal, settingsRow, userRows] = await Promise.all([
        listHolidays(),
        listEmployeeHolidays(),
        listTimeLeaveUsage(),
        listLeaveBalances(),
        getAttendanceSettings(),
        listAttendanceUsers(),
      ]);
      setHolidays(h);
      setEmployeeHolidays(eh);
      setTimeLeave(tl);
      setBalances(bal);
      setSettings(settingsRow);
      setUsers(userRows);
      setAnnualDays(settingsRow.annualHolidaysDays);
      setTempRatio(settingsRow.tempHolidaysPerFullHoliday);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const loadCoverData = useCallback(async () => {
    try {
      const [report, records] = await Promise.all([
        getEmployeeReport({
          fromDate: coverFilter.fromDate || undefined,
          toDate: coverFilter.toDate || undefined,
        }),
        listAttendanceRecords({
          fromDate: coverFilter.fromDate || undefined,
          toDate: coverFilter.toDate || undefined,
          limit: 5000,
        }),
      ]);
      setLateOccurrences(report.lateOccurrences);
      setEarlyExitOccurrences(report.earlyExitOccurrences);
      setCoverRecords(records);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('loadError'));
    }
  }, [coverFilter.fromDate, coverFilter.toDate, t]);

  useEffect(() => {
    void loadCore();
  }, [loadCore]);

  useEffect(() => {
    if (subtab === 'temporary') {
      void loadCoverData();
    }
  }, [subtab, loadCoverData]);

  const holidaysByType = useMemo(
    () => ({
      dayOff: holidays.filter((h) => h.type === 'day_off'),
      earlyExit: holidays.filter((h) => h.type === 'early_exit'),
      entryLate: holidays.filter((h) => h.type === 'entry_late'),
    }),
    [holidays],
  );

  async function refreshAfterMutation() {
    await loadCore();
    if (subtab === 'temporary') {
      await loadCoverData();
    }
  }

  async function handleAddOrgHoliday(
    type: AttendanceHolidayType,
    dateFrom: string,
    dateTo: string,
  ) {
    if (!canManage || !dateFrom) return;
    setError('');
    setSuccess('');
    const to = dateTo || dateFrom;
    try {
      if (to !== dateFrom) {
        await addHolidayRange({ dateFrom, dateTo: to, type });
      } else {
        await addHoliday({ date: dateFrom, type });
      }
      setSuccess(t('orgAdded'));
      await refreshAfterMutation();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('saveError'));
    }
  }

  async function handleAddEmployeeHoliday(e: React.FormEvent) {
    e.preventDefault();
    if (!canManage || !empUserId.trim() || !empDateFrom) return;
    setError('');
    setSuccess('');
    const to = empDateTo || empDateFrom;
    try {
      if (to !== empDateFrom) {
        await addEmployeeHolidayRange({
          deviceUserId: empUserId.trim(),
          dateFrom: empDateFrom,
          dateTo: to,
        });
      } else {
        await addEmployeeHoliday({
          deviceUserId: empUserId.trim(),
          date: empDateFrom,
        });
      }
      setSuccess(t('empAdded'));
      setEmpDateFrom('');
      setEmpDateTo('');
      await refreshAfterMutation();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('saveError'));
    }
  }

  async function handleSaveLeaveConfig(e: React.FormEvent) {
    e.preventDefault();
    if (!canManage) return;
    setError('');
    setSuccess('');
    try {
      const updated = await updateAttendanceSettings({
        annualHolidaysDays: annualDays,
        tempHolidaysPerFullHoliday: tempRatio,
      });
      setSettings(updated);
      setSuccess(t('configSaved'));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('saveError'));
    }
  }

  async function handleSetBalance(e: React.FormEvent) {
    e.preventDefault();
    if (!canManage || !balanceUserId.trim()) return;
    setError('');
    setSuccess('');
    try {
      await setLeaveBalance(balanceUserId.trim(), parseFloat(balanceDays));
      setSuccess(t('balanceSaved'));
      await refreshAfterMutation();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('saveError'));
    }
  }

  if (loading && !settings) {
    return <p className="text-sm text-slate-500">{tCommon('loading')}</p>;
  }

  return (
    <div className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      {!canManage && (
        <Alert variant="info">{t('viewOnly')}</Alert>
      )}

      <TabNav
        items={[
          { key: 'employee', label: t('subtabs.employee'), onClick: () => setSubtab('employee') },
          { key: 'official', label: t('subtabs.official'), onClick: () => setSubtab('official') },
          { key: 'temporary', label: t('subtabs.temporary'), onClick: () => setSubtab('temporary') },
          { key: 'settings', label: t('subtabs.settings'), onClick: () => setSubtab('settings') },
        ]}
        activeKey={subtab}
      />

      {subtab === 'settings' && (
        <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
          <h3 className="text-sm font-semibold text-slate-800">{t('leaveConfig')}</h3>
          <form onSubmit={handleSaveLeaveConfig} className="grid gap-4 sm:grid-cols-3">
            <Input
              label={t('annualDays')}
              type="number"
              min={0}
              value={annualDays}
              disabled={!canManage}
              onChange={(e) => setAnnualDays(parseInt(e.target.value, 10) || 0)}
            />
            <Input
              label={t('tempRatio')}
              type="number"
              min={1}
              value={tempRatio}
              disabled={!canManage}
              onChange={(e) => setTempRatio(parseInt(e.target.value, 10) || 1)}
            />
            <div className="flex items-end">
              <Button type="submit" disabled={!canManage}>
                {t('saveConfig')}
              </Button>
            </div>
          </form>
        </section>
      )}

      {subtab === 'employee' && (
        <div className="space-y-8">
          <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
            <h3 className="text-sm font-semibold text-slate-800">{t('leaveBalances')}</h3>
            <form onSubmit={handleSetBalance} className="grid gap-4 sm:grid-cols-3">
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium text-slate-700">{t('selectEmployee')}</span>
                <select
                  value={balanceUserId}
                  disabled={!canManage}
                  onChange={(e) => setBalanceUserId(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                >
                  <option value="">{t('selectEmployeePlaceholder')}</option>
                  {users.map((u) => (
                    <option key={u.deviceUserId} value={u.deviceUserId}>
                      {u.name || u.deviceUserId} ({u.deviceUserId})
                    </option>
                  ))}
                </select>
              </label>
              <Input
                label={t('balanceDays')}
                type="number"
                step="0.5"
                value={balanceDays}
                disabled={!canManage}
                onChange={(e) => setBalanceDays(e.target.value)}
              />
              <div className="flex items-end">
                <Button type="submit" disabled={!canManage}>
                  {t('setBalance')}
                </Button>
              </div>
            </form>
            <SimpleList
              items={balances.map((b) => ({
                id: b.deviceUserId,
                label: `${nameLookup.get(b.deviceUserId) || b.deviceUserId}: ${b.balanceDays}`,
              }))}
              emptyLabel={t('noBalances')}
            />
          </section>

          <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
            <h3 className="text-sm font-semibold text-slate-800">{t('employeeHolidays')}</h3>
            <form onSubmit={handleAddEmployeeHoliday} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block space-y-1.5 text-sm lg:col-span-2">
                <span className="font-medium text-slate-700">{t('selectEmployee')}</span>
                <select
                  value={empUserId}
                  disabled={!canManage}
                  onChange={(e) => setEmpUserId(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                >
                  <option value="">{t('selectEmployeePlaceholder')}</option>
                  {users.map((u) => (
                    <option key={u.deviceUserId} value={u.deviceUserId}>
                      {u.name || u.deviceUserId} ({u.deviceUserId})
                    </option>
                  ))}
                </select>
              </label>
              <Input
                label={t('dateFrom')}
                type="date"
                value={empDateFrom}
                disabled={!canManage}
                onChange={(e) => setEmpDateFrom(e.target.value)}
              />
              <Input
                label={t('dateTo')}
                type="date"
                value={empDateTo}
                disabled={!canManage}
                onChange={(e) => setEmpDateTo(e.target.value)}
              />
              <div className="flex items-end lg:col-span-4">
                <Button type="submit" disabled={!canManage}>
                  {t('addEmp')}
                </Button>
              </div>
            </form>
            <SimpleList
              items={employeeHolidays.map((h) => ({
                id: h.id,
                label: `${nameLookup.get(h.deviceUserId) || h.deviceUserId} — ${formatDisplayDate(h.date)}`,
              }))}
              emptyLabel={t('noEmp')}
              canManage={canManage}
              onRemove={async (id) => {
                await removeEmployeeHoliday(id);
                await refreshAfterMutation();
              }}
            />
          </section>
        </div>
      )}

      {subtab === 'official' && (
        <div className="space-y-8">
          <OfficialHolidayBlock
            title={t('orgDayOff')}
            holidayType="day_off"
            items={holidaysByType.dayOff}
            onAdd={handleAddOrgHoliday}
            canManage={canManage}
            t={t}
            onRemove={async (id) => {
              await removeHoliday(id);
              await refreshAfterMutation();
            }}
          />
          <OfficialHolidayBlock
            title={t('orgEarlyExit')}
            holidayType="early_exit"
            items={holidaysByType.earlyExit}
            onAdd={handleAddOrgHoliday}
            canManage={canManage}
            t={t}
            onRemove={async (id) => {
              await removeHoliday(id);
              await refreshAfterMutation();
            }}
          />
          <OfficialHolidayBlock
            title={t('orgLateEntry')}
            holidayType="entry_late"
            items={holidaysByType.entryLate}
            onAdd={handleAddOrgHoliday}
            canManage={canManage}
            t={t}
            onRemove={async (id) => {
              await removeHoliday(id);
              await refreshAfterMutation();
            }}
          />
        </div>
      )}

      {subtab === 'temporary' && settings && (
        <section className="space-y-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
          <AttendanceDateFilterBar filter={coverFilter} onChange={setCoverFilter} />
          <TimeLeaveCoverSection
            lateOccurrences={lateOccurrences}
            earlyExitOccurrences={earlyExitOccurrences}
            records={coverRecords}
            settings={settings}
            timeLeaveUsage={timeLeave}
            leaveBalances={balances}
            employeeHolidays={employeeHolidays}
            nameLookup={nameLookup}
            canManage={canManage}
            onCover={async (payload) => {
              await addTimeLeaveUsage(payload);
              setSuccess(t('coverSuccess'));
              await refreshAfterMutation();
            }}
            onRemove={async (id) => {
              await removeTimeLeaveUsage(id);
              await refreshAfterMutation();
            }}
          />
        </section>
      )}
    </div>
  );
}

function OfficialHolidayBlock({
  title,
  holidayType,
  items,
  onAdd,
  canManage,
  t,
  onRemove,
}: {
  title: string;
  holidayType: AttendanceHolidayType;
  items: AttendanceHoliday[];
  onAdd: (
    type: AttendanceHolidayType,
    dateFrom: string,
    dateTo: string,
  ) => Promise<void>;
  canManage: boolean;
  t: ReturnType<typeof useTranslations>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onAdd(holidayType, dateFrom, dateTo);
    setDateFrom('');
    setDateTo('');
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <form onSubmit={(e) => void handleSubmit(e)} className="grid gap-4 sm:grid-cols-3">
        <Input
          label={t('dateFrom')}
          type="date"
          value={dateFrom}
          disabled={!canManage}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <Input
          label={t('dateTo')}
          type="date"
          value={dateTo}
          disabled={!canManage}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <div className="flex items-end">
          <Button type="submit" disabled={!canManage}>
            {t('addOrg')}
          </Button>
        </div>
      </form>
      <HolidayList
        items={items}
        emptyLabel={t('noOrg')}
        canManage={canManage}
        typeLabel={(type) => t(`types.${type}` as 'types.day_off')}
        onRemove={onRemove}
      />
    </section>
  );
}

function HolidayList({
  items,
  emptyLabel,
  onRemove,
  typeLabel,
  canManage,
}: {
  items: AttendanceHoliday[];
  emptyLabel: string;
  onRemove: (id: string) => Promise<void>;
  typeLabel: (type: AttendanceHolidayType) => string;
  canManage: boolean;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  }
  return (
    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
          <span>
            {formatDisplayDate(item.date)} — {typeLabel(item.type)}
          </span>
          {canManage && (
            <Button type="button" variant="danger" onClick={() => void onRemove(item.id)}>
              ×
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}

function SimpleList({
  items,
  emptyLabel,
  onRemove,
  canManage = false,
}: {
  items: { id: string; label: string }[];
  emptyLabel: string;
  onRemove?: (id: string) => Promise<void>;
  canManage?: boolean;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  }
  return (
    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
          <span>{item.label}</span>
          {canManage && onRemove && (
            <Button type="button" variant="danger" onClick={() => void onRemove(item.id)}>
              ×
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
