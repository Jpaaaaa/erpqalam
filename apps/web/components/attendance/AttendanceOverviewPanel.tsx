'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  ApiClientError,
  getEmployeeReport,
  listAttendanceRecords,
  listAttendanceUsers,
} from '@/lib/api/attendance';
import { mergeEmployeesWithPunchIds } from '@/lib/attendance/employees';
import { todayDateKey } from '@/lib/attendance/formatters';
import { Alert } from '@/components/ui/Alert';
import { MetricCard } from '@/components/ui/MetricCard';

export function AttendanceOverviewPanel() {
  const t = useTranslations('attendance.overview');
  const tCommon = useTranslations('common');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [employeeCount, setEmployeeCount] = useState(0);
  const [todayPresent, setTodayPresent] = useState(0);
  const [lateToday, setLateToday] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState('0');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const today = todayDateKey();
    try {
      const [users, records, report] = await Promise.all([
        listAttendanceUsers(),
        listAttendanceRecords({ fromDate: today, toDate: today, limit: 500 }),
        getEmployeeReport({ fromDate: today, toDate: today }),
      ]);
      const merged = mergeEmployeesWithPunchIds(users, records);
      setEmployeeCount(merged.length);

      const presentIds = new Set<string>();
      for (const r of records) {
        if (
          r.punchType === 'entry_on_time' ||
          r.punchType === 'entry_late' ||
          r.punchType === 'exit' ||
          r.punchType === 'early_exit'
        ) {
          presentIds.add(r.deviceUserId);
        }
      }
      setTodayPresent(presentIds.size);
      setLateToday(records.filter((r) => r.punchType === 'entry_late').length);

      const totalExpected = report.rows.reduce(
        (s, r) => s + r.expectedWorkingDays,
        0,
      );
      const totalPresent = report.rows.reduce(
        (s, r) => s + r.workingDaysPresent,
        0,
      );
      const rate =
        totalExpected > 0
          ? ((totalPresent / totalExpected) * 100).toFixed(1)
          : '0';
      setAttendanceRate(rate);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const links = useMemo(
    () => [
      { href: '/dashboard/hr/attendance/records', label: t('linkRecords') },
      { href: '/dashboard/hr/attendance/report', label: t('linkReport') },
      { href: '/dashboard/hr/attendance/employees', label: t('linkEmployees') },
      { href: '/dashboard/hr/attendance/holidays', label: t('linkHolidays') },
      { href: '/dashboard/hr/attendance/settings', label: t('linkSettings') },
    ],
    [t],
  );

  if (loading) {
    return <p className="text-sm text-slate-500">{tCommon('loading')}</p>;
  }

  return (
    <div className="space-y-6">
      {error && <Alert variant="error">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={t('employees')}
          value={employeeCount}
          tone="teal"
          footer={t('employeesFooter')}
        />
        <MetricCard
          label={t('todayPresent')}
          value={todayPresent}
          tone="orange"
          footer={t('todayPresentFooter', { total: employeeCount })}
        />
        <MetricCard
          label={t('todayLate')}
          value={lateToday}
          tone="amber"
        />
        <MetricCard
          label={t('attendanceRate')}
          value={`${attendanceRate}%`}
          tone="teal"
          progress={parseFloat(attendanceRate)}
          footer={t('attendanceRateFooter')}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-2xl border border-slate-100 bg-white px-4 py-4 text-sm font-semibold text-slate-700 shadow-card transition hover:border-orange-200 hover:text-orange-600"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
