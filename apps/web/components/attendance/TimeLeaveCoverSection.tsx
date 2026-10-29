'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type {
  AttendanceRecord,
  AttendanceSettings,
  EmployeeHoliday,
  LeaveBalance,
  TimeLeaveType,
  TimeLeaveUsage,
} from '@/lib/types/attendance';
import {
  canCoverWithTimeLeave,
  countTimeLeaveForUser,
  fullHolidaysFromTempLeave,
  getBalanceDays,
  remainingLeaveDays,
  totalFullLeaveUsed,
  countEmployeeHolidaysForUser,
} from '@/lib/attendance/leave-balance';
import { findLateCoverTimestamp } from '@/lib/attendance/time-leave-cover';
import { formatDisplayDate } from '@/lib/attendance/formatters';
import { Button } from '@/components/ui/Button';

export function TimeLeaveCoverSection({
  lateOccurrences,
  earlyExitOccurrences,
  records,
  settings,
  timeLeaveUsage,
  leaveBalances,
  employeeHolidays,
  nameLookup,
  canManage,
  onCover,
  onRemove,
  showUsageList = true,
}: {
  lateOccurrences: { deviceUserId: string; date: string }[];
  earlyExitOccurrences: {
    deviceUserId: string;
    date: string;
    timestamp: string;
  }[];
  records: AttendanceRecord[];
  settings: AttendanceSettings;
  timeLeaveUsage: TimeLeaveUsage[];
  leaveBalances: LeaveBalance[];
  employeeHolidays: EmployeeHoliday[];
  nameLookup: Map<string, string>;
  canManage: boolean;
  onCover: (payload: {
    deviceUserId: string;
    date: string;
    timestamp: string;
    type: TimeLeaveType;
  }) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  showUsageList?: boolean;
}) {
  const t = useTranslations('attendance.holidays');
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const ctx = useMemo(
    () => ({
      tempHolidaysPerFullHoliday: settings.tempHolidaysPerFullHoliday,
      annualHolidaysDays: settings.annualHolidaysDays,
    }),
    [settings],
  );

  async function handleCover(
    key: string,
    payload: {
      deviceUserId: string;
      date: string;
      timestamp: string;
      type: TimeLeaveType;
    },
  ) {
    setBusyKey(key);
    try {
      await onCover(payload);
    } finally {
      setBusyKey(null);
    }
  }

  function statsLine(deviceUserId: string) {
    const tempCount = countTimeLeaveForUser(deviceUserId, timeLeaveUsage);
    const fullUsed = fullHolidaysFromTempLeave(
      tempCount,
      ctx.tempHolidaysPerFullHoliday,
    );
    const empCount = countEmployeeHolidaysForUser(deviceUserId, employeeHolidays);
    const remaining = remainingLeaveDays(
      deviceUserId,
      ctx,
      leaveBalances,
      timeLeaveUsage,
      employeeHolidays,
    );
    const balanceDays = getBalanceDays(deviceUserId, leaveBalances);
    const allowance =
      balanceDays > 0
        ? balanceDays + empCount
        : settings.annualHolidaysDays;
    return { tempCount, fullUsed, remaining, allowance: Math.max(1, allowance) };
  }

  return (
    <div className="space-y-8">
      <div>
        <h4 className="mb-3 text-sm font-semibold text-slate-800">{t('uncoveredLate')}</h4>
        {lateOccurrences.length === 0 ? (
          <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            {t('noUncoveredLate')}
          </p>
        ) : (
          <ul className="space-y-3">
            {lateOccurrences.map((o) => {
              const key = `late-${o.deviceUserId}-${o.date}`;
              const name = nameLookup.get(o.deviceUserId) || o.deviceUserId;
              const { tempCount, fullUsed, remaining, allowance } = statsLine(
                o.deviceUserId,
              );
              const canCover =
                canManage &&
                canCoverWithTimeLeave(
                  o.deviceUserId,
                  ctx,
                  leaveBalances,
                  timeLeaveUsage,
                  employeeHolidays,
                );
              return (
                <li
                  key={key}
                  className="flex flex-col gap-3 rounded-xl border border-orange-100 bg-orange-50/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-semibold text-slate-800">{name}</p>
                    <p className="text-xs text-slate-500">{formatDisplayDate(o.date)}</p>
                    <p className="text-xs text-slate-500">
                      {t('tempCount', { count: tempCount })} ·{' '}
                      {t('fullUsed', { used: fullUsed, total: allowance })} ·{' '}
                      {t('remaining', { count: remaining })}
                    </p>
                  </div>
                  {canManage && (
                    <Button
                      type="button"
                      disabled={!canCover || busyKey === key}
                      isLoading={busyKey === key}
                      onClick={() =>
                        void handleCover(key, {
                          deviceUserId: o.deviceUserId,
                          date: o.date,
                          timestamp: findLateCoverTimestamp(
                            records,
                            o.deviceUserId,
                            o.date,
                            settings,
                          ),
                          type: 'late_arrival',
                        })
                      }
                    >
                      {t('coverTimeLeave')}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold text-slate-800">{t('uncoveredEarly')}</h4>
        {earlyExitOccurrences.length === 0 ? (
          <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            {t('noUncoveredEarly')}
          </p>
        ) : (
          <ul className="space-y-3">
            {earlyExitOccurrences.map((o) => {
              const key = `early-${o.deviceUserId}-${o.date}`;
              const name = nameLookup.get(o.deviceUserId) || o.deviceUserId;
              const { tempCount, fullUsed, remaining, allowance } = statsLine(
                o.deviceUserId,
              );
              const canCover =
                canManage &&
                canCoverWithTimeLeave(
                  o.deviceUserId,
                  ctx,
                  leaveBalances,
                  timeLeaveUsage,
                  employeeHolidays,
                );
              return (
                <li
                  key={key}
                  className="flex flex-col gap-3 rounded-xl border border-amber-100 bg-amber-50/40 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-semibold text-slate-800">{name}</p>
                    <p className="text-xs text-slate-500">{formatDisplayDate(o.date)}</p>
                    <p className="text-xs text-slate-500">
                      {t('tempCount', { count: tempCount })} ·{' '}
                      {t('fullUsed', { used: fullUsed, total: allowance })} ·{' '}
                      {t('remaining', { count: remaining })}
                    </p>
                  </div>
                  {canManage && (
                    <Button
                      type="button"
                      disabled={!canCover || busyKey === key}
                      isLoading={busyKey === key}
                      onClick={() =>
                        void handleCover(key, {
                          deviceUserId: o.deviceUserId,
                          date: o.date,
                          timestamp: o.timestamp,
                          type: 'early_exit',
                        })
                      }
                    >
                      {t('coverTimeLeave')}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {showUsageList && (
      <div>
        <h4 className="mb-3 text-sm font-semibold text-slate-800">{t('timeLeave')}</h4>
        {timeLeaveUsage.length === 0 ? (
          <p className="text-sm text-slate-500">{t('noTimeLeave')}</p>
        ) : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
            {timeLeaveUsage.map((u) => {
              const key = u.id;
              const name = nameLookup.get(u.deviceUserId) || u.deviceUserId;
              const totalFull = totalFullLeaveUsed(
                u.deviceUserId,
                ctx,
                timeLeaveUsage,
                employeeHolidays,
              );
              return (
                <li
                  key={key}
                  className="flex flex-col gap-2 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <span>
                    {name} — {formatDisplayDate(u.date)} (
                    {t(`timeLeaveTypes.${u.type}` as 'timeLeaveTypes.late_arrival')})
                    · {t('fullUsedShort', { used: totalFull })}
                  </span>
                  {canManage && onRemove && (
                    <Button
                      type="button"
                      variant="danger"
                      disabled={busyKey === key}
                      onClick={async () => {
                        setBusyKey(key);
                        try {
                          await onRemove(u.id);
                        } finally {
                          setBusyKey(null);
                        }
                      }}
                    >
                      {t('removeTimeLeave')}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-2 text-xs text-slate-500">{t('timeLeaveHint')}</p>
      </div>
      )}
    </div>
  );
}
