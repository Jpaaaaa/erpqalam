'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ApiClientError,
  addEmployeeHoliday,
  addHoliday,
  getAttendanceSettings,
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
  EmployeeHoliday,
  LeaveBalance,
  TimeLeaveUsage,
} from '@/lib/types/attendance';
import { formatDisplayDate } from '@/lib/attendance/formatters';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function AttendanceHolidaysPanel() {
  const t = useTranslations('attendance.holidays');
  const tCommon = useTranslations('common');
  const [holidays, setHolidays] = useState<AttendanceHoliday[]>([]);
  const [employeeHolidays, setEmployeeHolidays] = useState<EmployeeHoliday[]>([]);
  const [timeLeave, setTimeLeave] = useState<TimeLeaveUsage[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [annualDays, setAnnualDays] = useState(7);
  const [tempRatio, setTempRatio] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orgDate, setOrgDate] = useState('');
  const [orgType, setOrgType] = useState<AttendanceHolidayType>('day_off');
  const [empUserId, setEmpUserId] = useState('');
  const [empDate, setEmpDate] = useState('');
  const [balanceUserId, setBalanceUserId] = useState('');
  const [balanceDays, setBalanceDays] = useState('7');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [h, eh, tl, bal, settings] = await Promise.all([
        listHolidays(),
        listEmployeeHolidays(),
        listTimeLeaveUsage(),
        listLeaveBalances(),
        getAttendanceSettings(),
      ]);
      setHolidays(h);
      setEmployeeHolidays(eh);
      setTimeLeave(tl);
      setBalances(bal);
      setAnnualDays(settings.annualHolidaysDays);
      setTempRatio(settings.tempHolidaysPerFullHoliday);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const holidaysByType = useMemo(() => {
    return {
      dayOff: holidays.filter((h) => h.type === 'day_off'),
      earlyExit: holidays.filter((h) => h.type === 'early_exit'),
      entryLate: holidays.filter((h) => h.type === 'entry_late'),
    };
  }, [holidays]);

  async function handleAddOrgHoliday(e: React.FormEvent) {
    e.preventDefault();
    if (!orgDate) return;
    setError('');
    setSuccess('');
    try {
      await addHoliday({ date: orgDate, type: orgType });
      setSuccess(t('orgAdded'));
      setOrgDate('');
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('saveError'));
    }
  }

  async function handleAddEmployeeHoliday(e: React.FormEvent) {
    e.preventDefault();
    if (!empUserId.trim() || !empDate) return;
    setError('');
    setSuccess('');
    try {
      await addEmployeeHoliday({ deviceUserId: empUserId.trim(), date: empDate });
      setSuccess(t('empAdded'));
      setEmpDate('');
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('saveError'));
    }
  }

  async function handleSaveLeaveConfig(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await updateAttendanceSettings({
        annualHolidaysDays: annualDays,
        tempHolidaysPerFullHoliday: tempRatio,
      });
      setSuccess(t('configSaved'));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('saveError'));
    }
  }

  async function handleSetBalance(e: React.FormEvent) {
    e.preventDefault();
    if (!balanceUserId.trim()) return;
    setError('');
    setSuccess('');
    try {
      await setLeaveBalance(balanceUserId.trim(), parseFloat(balanceDays));
      setSuccess(t('balanceSaved'));
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('saveError'));
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">{tCommon('loading')}</p>;
  }

  return (
    <div className="space-y-8">
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        <h3 className="text-sm font-semibold text-slate-800">{t('leaveConfig')}</h3>
        <form onSubmit={handleSaveLeaveConfig} className="grid gap-4 sm:grid-cols-3">
          <Input
            label={t('annualDays')}
            type="number"
            min={0}
            value={annualDays}
            onChange={(e) => setAnnualDays(parseInt(e.target.value, 10) || 0)}
          />
          <Input
            label={t('tempRatio')}
            type="number"
            min={1}
            value={tempRatio}
            onChange={(e) => setTempRatio(parseInt(e.target.value, 10) || 1)}
          />
          <div className="flex items-end">
            <Button type="submit">{t('saveConfig')}</Button>
          </div>
        </form>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        <h3 className="text-sm font-semibold text-slate-800">{t('orgHolidays')}</h3>
        <form onSubmit={handleAddOrgHoliday} className="grid gap-4 sm:grid-cols-3">
          <Input label={t('date')} type="date" value={orgDate} onChange={(e) => setOrgDate(e.target.value)} />
          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-slate-700">{t('type')}</span>
            <select
              value={orgType}
              onChange={(e) => setOrgType(e.target.value as AttendanceHolidayType)}
              className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="day_off">{t('types.day_off')}</option>
              <option value="early_exit">{t('types.early_exit')}</option>
              <option value="entry_late">{t('types.entry_late')}</option>
            </select>
          </label>
          <div className="flex items-end">
            <Button type="submit">{t('addOrg')}</Button>
          </div>
        </form>
        <HolidayList
          items={holidays}
          emptyLabel={t('noOrg')}
          onRemove={async (id) => {
            await removeHoliday(id);
            await load();
          }}
          typeLabel={(type) => t(`types.${type}` as 'types.day_off')}
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        <h3 className="text-sm font-semibold text-slate-800">{t('employeeHolidays')}</h3>
        <form onSubmit={handleAddEmployeeHoliday} className="grid gap-4 sm:grid-cols-3">
          <Input label={t('deviceUserId')} value={empUserId} onChange={(e) => setEmpUserId(e.target.value)} />
          <Input label={t('date')} type="date" value={empDate} onChange={(e) => setEmpDate(e.target.value)} />
          <div className="flex items-end">
            <Button type="submit">{t('addEmp')}</Button>
          </div>
        </form>
        <SimpleList
          items={employeeHolidays.map((h) => ({
            id: h.id,
            label: `${h.deviceUserId} — ${formatDisplayDate(h.date)}`,
          }))}
          emptyLabel={t('noEmp')}
          onRemove={async (id) => {
            await removeEmployeeHoliday(id);
            await load();
          }}
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        <h3 className="text-sm font-semibold text-slate-800">{t('leaveBalances')}</h3>
        <form onSubmit={handleSetBalance} className="grid gap-4 sm:grid-cols-3">
          <Input label={t('deviceUserId')} value={balanceUserId} onChange={(e) => setBalanceUserId(e.target.value)} />
          <Input label={t('balanceDays')} type="number" step="0.5" value={balanceDays} onChange={(e) => setBalanceDays(e.target.value)} />
          <div className="flex items-end">
            <Button type="submit">{t('setBalance')}</Button>
          </div>
        </form>
        <SimpleList
          items={balances.map((b) => ({
            id: b.deviceUserId,
            label: `${b.deviceUserId}: ${b.balanceDays}`,
          }))}
          emptyLabel={t('noBalances')}
        />
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        <h3 className="text-sm font-semibold text-slate-800">{t('timeLeave')}</h3>
        <SimpleList
          items={timeLeave.map((u) => ({
            id: u.id,
            label: `${u.deviceUserId} — ${formatDisplayDate(u.date)} (${t(`timeLeaveTypes.${u.type}` as 'timeLeaveTypes.late_arrival')})`,
          }))}
          emptyLabel={t('noTimeLeave')}
          onRemove={async (id) => {
            await removeTimeLeaveUsage(id);
            await load();
          }}
        />
        <p className="text-xs text-slate-500">{t('timeLeaveHint')}</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3 text-sm text-slate-600">
        <div>{t('summaryDayOff')}: {holidaysByType.dayOff.length}</div>
        <div>{t('summaryEarly')}: {holidaysByType.earlyExit.length}</div>
        <div>{t('summaryLate')}: {holidaysByType.entryLate.length}</div>
      </div>
    </div>
  );
}

function HolidayList({
  items,
  emptyLabel,
  onRemove,
  typeLabel,
}: {
  items: AttendanceHoliday[];
  emptyLabel: string;
  onRemove: (id: string) => Promise<void>;
  typeLabel: (type: AttendanceHolidayType) => string;
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
          <Button type="button" variant="danger" onClick={() => onRemove(item.id)}>
            ×
          </Button>
        </li>
      ))}
    </ul>
  );
}

function SimpleList({
  items,
  emptyLabel,
  onRemove,
}: {
  items: { id: string; label: string }[];
  emptyLabel: string;
  onRemove?: (id: string) => Promise<void>;
}) {
  if (items.length === 0) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  }
  return (
    <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
          <span>{item.label}</span>
          {onRemove && (
            <Button type="button" variant="danger" onClick={() => onRemove(item.id)}>
              ×
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
