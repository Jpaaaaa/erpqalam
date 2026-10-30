import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveUserFacingError } from '../api/client';
import {
  getDailyReport,
  getDailySummaries,
  listAttendanceRecords,
  listAttendanceUsers,
} from '../api/attendance';
import { getQuickRange, shiftDateKey, todayDateKey } from '../attendance/formatters';
import { buildNameLookup, mergeEmployeesWithPunchIds } from '../attendance/lookups';
import type {
  AttendanceRecord,
  DailyAttendanceRow,
  DailyAttendanceSummary,
} from '../types/attendance';

export type WeekBar = {
  dateKey: string;
  rate: number;
  isToday: boolean;
};

export type AttentionItem = {
  deviceUserId: string;
  name: string;
  status: DailyAttendanceRow['status'];
  entryTime: string | null;
  exitTime: string | null;
};

function datesInRange(from: string, to: string): string[] {
  const out: string[] = [];
  let d = from;
  while (d <= to) {
    out.push(d);
    d = shiftDateKey(d, 1);
  }
  return out;
}

const weekdayIndex = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
} as const;

export type WeekdayLabelKey = (typeof weekdayIndex)[keyof typeof weekdayIndex];

export function dateToWeekdayKey(dateKey: string): WeekdayLabelKey {
  const [y, m, day] = dateKey.split('-').map((p) => parseInt(p, 10));
  const dow = new Date(y, m - 1, day).getDay();
  return weekdayIndex[dow as keyof typeof weekdayIndex];
}

export function useHomeDashboard() {
  const { t } = useTranslation('attendance');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [errorIsNetwork, setErrorIsNetwork] = useState(false);

  const [summary, setSummary] = useState<DailyAttendanceSummary | null>(null);
  const [rows, setRows] = useState<DailyAttendanceRow[]>([]);
  const [weekBars, setWeekBars] = useState<WeekBar[]>([]);
  const [weeklyAvg, setWeeklyAvg] = useState(0);
  const [attendancePct, setAttendancePct] = useState(0);
  const [punctualityPct, setPunctualityPct] = useState(0);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [nameLookup, setNameLookup] = useState<Map<string, string>>(new Map());

  const load = useCallback(async () => {
    setError('');
    setErrorIsNetwork(false);
    const today = todayDateKey();
    const week = getQuickRange('week');
    try {
      const [report, weekData, records, users] = await Promise.all([
        getDailyReport(today),
        getDailySummaries({ fromDate: week.from, toDate: week.to }),
        listAttendanceRecords({ fromDate: today, toDate: today, limit: 50 }),
        listAttendanceUsers(),
      ]);

      setSummary(report.summary);
      setRows(report.rows);
      setNameLookup(
        buildNameLookup(mergeEmployeesWithPunchIds(users, records)),
      );

      const sorted = [...records].sort((a, b) =>
        b.timestamp.localeCompare(a.timestamp),
      );
      setRecentRecords(sorted.slice(0, 5));

      const s = report.summary;
      const att =
        s.employeeCount > 0
          ? Math.round((s.present / s.employeeCount) * 100)
          : 0;
      setAttendancePct(att);

      const onTime = report.rows.filter((r) => r.status === 'on_time').length;
      const late = report.rows.filter((r) => r.status === 'late').length;
      const withEntry = onTime + late;
      setPunctualityPct(
        withEntry > 0 ? Math.round((onTime / withEntry) * 100) : 0,
      );

      const summaryMap = new Map(
        weekData.summaries.map((item) => [item.date, item.summary]),
      );
      const rates: number[] = [];
      const bars: WeekBar[] = datesInRange(week.from, week.to).map((dateKey) => {
        const day = summaryMap.get(dateKey);
        const rate =
          day && day.employeeCount > 0
            ? Math.round((day.present / day.employeeCount) * 100)
            : 0;
        if (day && day.employeeCount > 0) rates.push(day.present / day.employeeCount);
        return { dateKey, rate, isToday: dateKey === today };
      });
      setWeekBars(bars);
      setWeeklyAvg(
        rates.length > 0
          ? Math.round((rates.reduce((a, b) => a + b, 0) / rates.length) * 100)
          : 0,
      );
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'home.loadError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const attentionItems: AttentionItem[] = useMemo(() => {
    const priority: Record<string, number> = {
      late: 0,
      early_exit: 1,
    };
    return rows
      .filter((r) => r.status === 'late' || r.status === 'early_exit')
      .sort(
        (a, b) =>
          (priority[a.status] ?? 9) - (priority[b.status] ?? 9),
      )
      .map((row) => ({
        deviceUserId: row.deviceUserId,
        name: nameLookup.get(row.deviceUserId) || row.deviceUserId,
        status: row.status,
        entryTime: row.entryTime,
        exitTime: row.exitTime,
      }));
  }, [rows, nameLookup]);

  return {
    loading,
    refreshing,
    setRefreshing,
    error,
    errorIsNetwork,
    load,
    summary,
    rows,
    attendancePct,
    punctualityPct,
    weeklyAvg,
    weekBars,
    weekdayKey: dateToWeekdayKey,
    attentionItems,
    recentRecords,
    nameLookup,
  };
}
