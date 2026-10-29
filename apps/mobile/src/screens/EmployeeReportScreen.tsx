import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { resolveUserFacingError } from '../api/client';
import {
  addTimeLeaveUsage,
  getAttendanceSettings,
  getEmployeeReport,
  listAttendanceRecords,
  listAttendanceUsers,
  listEmployeeHolidays,
  listHolidays,
  listLeaveBalances,
  listTimeLeaveUsage,
  removeTimeLeaveUsage,
  shareAttendanceReportPdf,
} from '../api/attendance';
import { canCoverWithTimeLeave } from '../attendance/leave-balance';
import {
  displayName,
  formatDisplayDate,
  formatDisplayTime,
  getQuickRange,
} from '../attendance/formatters';
import { buildEmployeeDayRows } from '../attendance/report-days';
import {
  earlyExitCoverId,
  isEarlyExitCovered,
  isLateArrivalCovered,
  lateArrivalCoverId,
} from '../attendance/time-leave-cover';
import { DateRangeChips } from '../components/DateRangeChips';
import { EmployeePicker } from '../components/EmployeePicker';
import { MetricCard } from '../components/MetricCard';
import { TimeLeaveCoverList } from '../components/TimeLeaveCoverList';
import { ViewOnlyBanner } from '../components/ViewOnlyBanner';
import { useCanManageAttendance } from '../hooks/useCanManageAttendance';
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
  TimeLeaveUsage,
} from '../types/attendance';
import { SearchField } from '../components/SearchField';
import { NetworkErrorPanel } from '../components/NetworkErrorPanel';
import {
  LoadingListSkeleton,
  LoadingMetricsSkeleton,
} from '../components/LoadingMetricsSkeleton';
import { buildNameLookup, mergeEmployeesWithPunchIds } from '../attendance/lookups';
import { useI18n } from '../i18n/I18nProvider';
import { mirroredRow } from '../ui/rtlLayout';

type ReportTab = 'performance' | 'per-employee' | 'summary';
import { AppText } from '../ui/AppText';
import { ltrText } from '../ui/ltr';

export function EmployeeReportScreen() {
  const { t } = useTranslation('attendance');
  const canManage = useCanManageAttendance();
  const [tab, setTab] = useState<ReportTab>('performance');
  const [search, setSearch] = useState('');
  const [performanceRows, setPerformanceRows] = useState<EmployeeReportRow[]>([]);
  const [nameLookup, setNameLookup] = useState<Map<string, string>>(new Map());
  const [filter, setFilter] = useState<DateFilter>(() => {
    const month = getQuickRange('month');
    return { fromDate: month.from, toDate: month.to };
  });
  const [users, setUsers] = useState<AttendanceUser[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [settings, setSettings] = useState<AttendanceSettings | null>(null);
  const [holidays, setHolidays] = useState<AttendanceHoliday[]>([]);
  const [employeeHolidays, setEmployeeHolidays] = useState<EmployeeHoliday[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [timeLeaveUsage, setTimeLeaveUsage] = useState<TimeLeaveUsage[]>([]);
  const [reportRow, setReportRow] = useState<{
    present: number;
    expected: number;
    absent: number;
    late: number;
    early: number;
  } | null>(null);
  const [lateOccurrences, setLateOccurrences] = useState<
    { deviceUserId: string; date: string }[]
  >([]);
  const [earlyOccurrences, setEarlyOccurrences] = useState<
    { deviceUserId: string; date: string; timestamp: string }[]
  >([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [metaReady, setMetaReady] = useState(false);
  const [perfReady, setPerfReady] = useState(false);
  const [employeeReady, setEmployeeReady] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [coverBusy, setCoverBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [errorIsNetwork, setErrorIsNetwork] = useState(false);
  const { mirrorLayout } = useI18n();

  const selectedUser = users.find((u) => u.deviceUserId === selectedId);

  const loadMeta = useCallback(async () => {
    setError('');
    setErrorIsNetwork(false);
    try {
      const [userRows, settingsRow, holidayRows, empHolidayRows, bal, tl] =
        await Promise.all([
          listAttendanceUsers(),
          getAttendanceSettings(),
          listHolidays(),
          listEmployeeHolidays(),
          listLeaveBalances(),
          listTimeLeaveUsage(),
        ]);
      setUsers(userRows);
      setNameLookup(buildNameLookup(mergeEmployeesWithPunchIds(userRows, [])));
      setSettings(settingsRow);
      setHolidays(holidayRows);
      setEmployeeHolidays(empHolidayRows);
      setBalances(bal);
      setTimeLeaveUsage(tl);
      setMetaReady(true);
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'report.loadError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
      setMetaReady(false);
    } finally {
      setRefreshing(false);
    }
  }, [t]);

  const loadPerformanceReport = useCallback(async () => {
    setPerfReady(false);
    try {
      const report = await getEmployeeReport({
        fromDate: filter.fromDate,
        toDate: filter.toDate,
      });
      setPerformanceRows(report.rows);
      setPerfReady(true);
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'report.loadError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
      setPerfReady(false);
    }
  }, [filter.fromDate, filter.toDate, t]);

  const loadReport = useCallback(async () => {
    if (!selectedId) {
      setReportRow(null);
      setLateOccurrences([]);
      setEarlyOccurrences([]);
      return;
    }
    try {
      const report = await getEmployeeReport({
        fromDate: filter.fromDate,
        toDate: filter.toDate,
      });
      const row = report.rows.find((r) => r.deviceUserId === selectedId);
      const early = report.earlyExitOccurrences.filter(
        (o) => o.deviceUserId === selectedId,
      ).length;
      setReportRow(
        row
          ? {
              present: row.workingDaysPresent,
              expected: row.expectedWorkingDays,
              absent: row.daysAbsent,
              late: row.lateCount,
              early,
            }
          : {
              present: 0,
              expected: 0,
              absent: 0,
              late: 0,
              early,
            },
      );
      setLateOccurrences(
        report.lateOccurrences.filter((o) => o.deviceUserId === selectedId),
      );
      setEarlyOccurrences(
        report.earlyExitOccurrences.filter((o) => o.deviceUserId === selectedId),
      );
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'report.loadError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
      throw err;
    }
  }, [selectedId, filter.fromDate, filter.toDate, t]);

  const loadRecords = useCallback(async () => {
    if (!selectedId) {
      setRecords([]);
      return;
    }
    try {
      const rows = await listAttendanceRecords({
        deviceUserId: selectedId,
        fromDate: filter.fromDate,
        toDate: filter.toDate,
        limit: 5000,
      });
      setRecords(rows);
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'report.loadError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
      throw err;
    }
  }, [selectedId, filter.fromDate, filter.toDate, t]);

  useEffect(() => {
    void loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    void loadPerformanceReport();
  }, [loadPerformanceReport]);

  useEffect(() => {
    if (tab !== 'per-employee') {
      setEmployeeReady(true);
      return;
    }
    if (!selectedId) {
      setEmployeeReady(true);
      return;
    }
    setEmployeeReady(false);
    void Promise.all([loadReport(), loadRecords()])
      .then(() => setEmployeeReady(true))
      .catch(() => setEmployeeReady(false));
  }, [tab, selectedId, loadReport, loadRecords]);

  const dayRows = useMemo(() => {
    if (!selectedId || !settings) return [];
    return buildEmployeeDayRows({
      deviceUserId: selectedId,
      records,
      user: selectedUser,
      settings,
      holidays,
      employeeHolidays,
      fromDate: filter.fromDate,
      toDate: filter.toDate,
    });
  }, [
    selectedId,
    settings,
    records,
    selectedUser,
    holidays,
    employeeHolidays,
    filter.fromDate,
    filter.toDate,
  ]);

  const leaveCtx = settings
    ? {
        tempHolidaysPerFullHoliday: settings.tempHolidaysPerFullHoliday,
        annualHolidaysDays: settings.annualHolidaysDays,
      }
    : null;

  function canAddCover(deviceUserId: string) {
    if (!leaveCtx) return false;
    return canCoverWithTimeLeave(
      deviceUserId,
      leaveCtx,
      balances,
      timeLeaveUsage,
      employeeHolidays,
    );
  }

  async function refreshAfterCover() {
    const [tl, report] = await Promise.all([
      listTimeLeaveUsage(),
      getEmployeeReport({
        fromDate: filter.fromDate,
        toDate: filter.toDate,
      }),
    ]);
    setTimeLeaveUsage(tl);
    if (selectedId) {
      setLateOccurrences(
        report.lateOccurrences.filter((o) => o.deviceUserId === selectedId),
      );
      setEarlyOccurrences(
        report.earlyExitOccurrences.filter((o) => o.deviceUserId === selectedId),
      );
      await loadRecords();
    }
    await loadReport();
    await loadPerformanceReport();
  }

  const filteredPerformance = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return performanceRows;
    return performanceRows.filter((row) => {
      const name = nameLookup.get(row.deviceUserId) || row.deviceUserId;
      return (
        row.deviceUserId.toLowerCase().includes(q) ||
        name.toLowerCase().includes(q)
      );
    });
  }, [performanceRows, search, nameLookup]);

  const summaryTotals = useMemo(() => {
    return filteredPerformance.reduce(
      (acc, row) => ({
        present: acc.present + row.workingDaysPresent,
        absent: acc.absent + row.daysAbsent,
        late: acc.late + row.lateCount,
        expected: acc.expected + row.expectedWorkingDays,
      }),
      { present: 0, absent: 0, late: 0, expected: 0 },
    );
  }, [filteredPerformance]);

  const attendanceRate =
    summaryTotals.expected > 0
      ? Math.round((summaryTotals.present / summaryTotals.expected) * 100)
      : 0;

  const balanceLookup = useMemo(
    () => new Map(balances.map((b) => [b.deviceUserId, b.balanceDays])),
    [balances],
  );

  async function handlePdf() {
    if (tab === 'per-employee' && !selectedId) {
      setError(t('report.selectEmployeeFirst'));
      return;
    }
    setExporting(true);
    setError('');
    try {
      await shareAttendanceReportPdf({
        type: tab,
        fromDate: filter.fromDate,
        toDate: filter.toDate,
        deviceUserId: tab === 'per-employee' ? selectedId : undefined,
      });
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'report.pdfError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
    } finally {
      setExporting(false);
    }
  }

  function punchLabel(type: PunchType | null | undefined) {
    if (!type) return '–';
    return t(`punchTypes.${type}`);
  }

  const tabs: { key: ReportTab; label: string }[] = [
    { key: 'performance', label: t('report.tabs.performance') },
    { key: 'per-employee', label: t('report.tabs.perEmployee') },
    { key: 'summary', label: t('report.tabs.summary') },
  ];

  const showContentLoading =
    !metaReady ||
    refreshing ||
    ((tab === 'performance' || tab === 'summary') && !perfReady) ||
    (tab === 'per-employee' && !!selectedId && !employeeReady);

  const retryAll = () => {
    void loadMeta();
    void loadPerformanceReport();
    if (tab === 'per-employee' && selectedId) {
      setEmployeeReady(false);
      void Promise.all([loadReport(), loadRecords()])
        .then(() => setEmployeeReady(true))
        .catch(() => setEmployeeReady(false));
    }
  };

  return (
    <View style={styles.container}>
      {!canManage ? <ViewOnlyBanner /> : null}
      <View style={[styles.tabRow, mirroredRow(mirrorLayout)]}>
        {tabs.map((item) => (
          <Pressable
            key={item.key}
            style={[styles.tabChip, tab === item.key && styles.tabChipActive]}
            onPress={() => setTab(item.key)}
          >
            <AppText
              style={[styles.tabText, tab === item.key && styles.tabTextActive]}
              numberOfLines={1}
            >
              {item.label}
            </AppText>
          </Pressable>
        ))}
      </View>
      <DateRangeChips filter={filter} onChange={setFilter} />
      {tab !== 'per-employee' ? (
        <SearchField
          value={search}
          onChangeText={setSearch}
          placeholder={t('report.searchPlaceholder')}
        />
      ) : null}
      {tab === 'per-employee' ? (
        <EmployeePicker users={users} value={selectedId} onChange={setSelectedId} />
      ) : null}

      <Pressable
        style={[styles.pdfBtn, exporting && styles.pdfBtnDisabled]}
        disabled={exporting || (tab === 'per-employee' && !selectedId)}
        onPress={() => void handlePdf()}
      >
        {exporting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <AppText style={styles.pdfBtnText}>{t('report.generatePdf')}</AppText>
        )}
      </Pressable>

      {errorIsNetwork ? (
        <NetworkErrorPanel message={error} onRetry={retryAll} />
      ) : error ? (
        <AppText style={styles.error}>{error}</AppText>
      ) : null}

      {showContentLoading ? (
        <>
          <LoadingMetricsSkeleton count={6} />
          <LoadingListSkeleton rows={4} />
        </>
      ) : tab === 'summary' ? (
        <View style={styles.metrics}>
          <MetricCard
            label={t('report.employeeCount')}
            value={filteredPerformance.length}
          />
          <MetricCard label={t('report.presentDays')} value={summaryTotals.present} />
          <MetricCard label={t('report.expectedDays')} value={summaryTotals.expected} />
          <MetricCard label={t('report.absentDays')} value={summaryTotals.absent} />
          <MetricCard label={t('report.lateEvents')} value={summaryTotals.late} />
          <MetricCard
            label={t('report.attendanceRate')}
            value={`${attendanceRate}%`}
          />
        </View>
      ) : tab === 'performance' ? (
        <FlatList
          data={filteredPerformance}
          keyExtractor={(item) => item.deviceUserId}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                setPerfReady(false);
                void Promise.all([loadMeta(), loadPerformanceReport()]);
              }}
              tintColor="#0f766e"
            />
          }
          ListEmptyComponent={
            <AppText style={styles.empty}>{t('report.empty')}</AppText>
          }
          renderItem={({ item }) => {
            const name = displayName(
              nameLookup.get(item.deviceUserId),
              item.deviceUserId,
            );
            return (
              <View style={styles.perfCard}>
                <View style={[styles.perfHeader, mirroredRow(mirrorLayout)]}>
                  <AppText style={styles.perfName} numberOfLines={1}>
                    {name}
                  </AppText>
                  <AppText style={styles.balanceTag} numberOfLines={1}>
                    {t('report.leaveBalance')}:{' '}
                    {balanceLookup.get(item.deviceUserId) ?? 0}
                  </AppText>
                </View>
                <AppText style={[styles.perfId, ltrText]} numberOfLines={1}>
                  {item.deviceUserId}
                </AppText>
                <View style={styles.metrics}>
                  <MetricCard label={t('report.present')} value={item.workingDaysPresent} />
                  <MetricCard label={t('report.expected')} value={item.expectedWorkingDays} />
                  <MetricCard label={t('report.absent')} value={item.daysAbsent} />
                  <MetricCard label={t('report.late')} value={item.lateCount} />
                </View>
              </View>
            );
          }}
        />
      ) : !selectedId ? (
        <AppText style={styles.hint}>{t('report.selectEmployeeHint')}</AppText>
      ) : (
        <FlatList
          data={dayRows}
          keyExtractor={(item) => item.date}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                setEmployeeReady(false);
                void Promise.all([loadMeta(), loadReport(), loadRecords()]).then(() =>
                  setEmployeeReady(true),
                );
              }}
              tintColor="#0f766e"
            />
          }
          ListHeaderComponent={
            <>
              {reportRow ? (
                <View style={styles.metrics}>
                  <MetricCard label={t('report.present')} value={reportRow.present} />
                  <MetricCard label={t('report.expected')} value={reportRow.expected} />
                  <MetricCard label={t('report.absent')} value={reportRow.absent} />
                  <MetricCard label={t('report.late')} value={reportRow.late} />
                  <MetricCard
                    label={t('report.earlyEvents')}
                    value={reportRow.early}
                  />
                  <MetricCard
                    label={t('report.leaveBalance')}
                    value={balanceLookup.get(selectedId) ?? 0}
                  />
                </View>
              ) : null}
              {settings &&
              selectedId &&
              (lateOccurrences.length > 0 || earlyOccurrences.length > 0) ? (
                <TimeLeaveCoverList
                  deviceUserId={selectedId}
                  employeeName={displayName(selectedUser?.name, selectedId)}
                  lateOccurrences={lateOccurrences}
                  earlyExitOccurrences={earlyOccurrences}
                  records={records}
                  settings={settings}
                  timeLeaveUsage={timeLeaveUsage}
                  leaveBalances={balances}
                  employeeHolidays={employeeHolidays}
                  canManage={canManage}
                  onCover={async (payload) => {
                    await addTimeLeaveUsage(payload);
                    await refreshAfterCover();
                  }}
                  onRemove={async (id) => {
                    await removeTimeLeaveUsage(id);
                    await refreshAfterCover();
                  }}
                />
              ) : null}
            </>
          }
          ListEmptyComponent={
            <AppText style={styles.empty}>{t('report.emptyDays')}</AppText>
          }
          renderItem={({ item: day }) => (
            <DayRowCard
              day={day}
              deviceUserId={selectedId}
              canManage={canManage}
              canAdd={canAddCover(selectedId)}
              coverBusy={coverBusy}
              timeLeaveUsage={timeLeaveUsage}
              t={t}
              punchLabel={punchLabel}
              mirrorLayout={mirrorLayout}
              onCover={async (payload) => {
                setCoverBusy(payload.timestamp);
                try {
                  await addTimeLeaveUsage(payload);
                  await refreshAfterCover();
                } finally {
                  setCoverBusy(null);
                }
              }}
              onRemove={async (id) => {
                setCoverBusy(id);
                try {
                  await removeTimeLeaveUsage(id);
                  await refreshAfterCover();
                } finally {
                  setCoverBusy(null);
                }
              }}
            />
          )}
        />
      )}
    </View>
  );
}

function DayRowCard({
  day,
  deviceUserId,
  canManage,
  canAdd,
  coverBusy,
  timeLeaveUsage,
  t,
  punchLabel,
  onCover,
  onRemove,
  mirrorLayout,
}: {
  day: ReturnType<typeof buildEmployeeDayRows>[number];
  deviceUserId: string;
  canManage: boolean;
  canAdd: boolean;
  coverBusy: string | null;
  timeLeaveUsage: TimeLeaveUsage[];
  t: (key: string) => string;
  punchLabel: (type: PunchType | null | undefined) => string;
  onCover: (payload: {
    deviceUserId: string;
    date: string;
    timestamp: string;
    type: 'late_arrival' | 'early_exit';
  }) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  mirrorLayout: boolean;
}) {
  const isLate = day.entryType === 'entry_late';
  const isEarly = day.exitType === 'early_exit';
  const entryCovered =
    isLate && day.entryTime
      ? isLateArrivalCovered(day.entryTime, timeLeaveUsage)
      : false;
  const exitCovered = isEarly
    ? isEarlyExitCovered(deviceUserId, day.date, timeLeaveUsage)
    : false;
  const entryCoverId =
    day.entryTime && isLate
      ? lateArrivalCoverId(day.entryTime, timeLeaveUsage)
      : null;
  const exitCoverId = isEarly
    ? earlyExitCoverId(deviceUserId, day.date, timeLeaveUsage)
    : null;

  return (
    <View style={styles.dayCard}>
      <View style={[styles.dayHeader, mirroredRow(mirrorLayout)]}>
        <AppText style={[styles.dayDate, ltrText]} numberOfLines={1}>
          {formatDisplayDate(day.date)}
        </AppText>
        {day.isHoliday ? (
          <AppText style={styles.tagHoliday} numberOfLines={1}>
            {t('report.holiday')}
          </AppText>
        ) : null}
        {day.isNotComing ? (
          <AppText style={styles.tagAbsent} numberOfLines={1}>
            {t('report.didNotCome')}
          </AppText>
        ) : null}
      </View>
      {!day.isHoliday && !day.isNotComing ? (
        <>
          <AppText style={styles.dayLine}>
            {t('report.entryTime')}:{' '}
            <AppText style={ltrText}>
              {day.entryTime ? formatDisplayTime(day.entryTime) : '–'}
            </AppText>
            {' · '}
            {punchLabel(day.entryType)}
          </AppText>
          <AppText style={styles.dayLine}>
            {t('report.exitTime')}:{' '}
            <AppText style={ltrText}>
              {day.exitTime ? formatDisplayTime(day.exitTime) : '–'}
            </AppText>
            {' · '}
            {punchLabel(day.exitType)}
          </AppText>
          {canManage ? (
            <View style={styles.coverRow}>
              {isLate && day.entryTime ? (
                entryCovered && entryCoverId ? (
                  <Pressable
                    disabled={coverBusy === entryCoverId}
                    onPress={() => void onRemove(entryCoverId)}
                  >
                    <AppText style={styles.linkDanger}>{t('report.uncoverLate')}</AppText>
                  </Pressable>
                ) : (
                  <Pressable
                    disabled={!canAdd || coverBusy === day.entryTime}
                    onPress={() =>
                      void onCover({
                        deviceUserId,
                        date: day.date,
                        timestamp: day.entryTime!,
                        type: 'late_arrival',
                      })
                    }
                  >
                    <AppText style={styles.link}>{t('report.coverLate')}</AppText>
                  </Pressable>
                )
              ) : null}
              {isEarly ? (
                exitCovered && exitCoverId ? (
                  <Pressable
                    disabled={coverBusy === exitCoverId}
                    onPress={() => void onRemove(exitCoverId)}
                  >
                    <AppText style={styles.linkDanger}>{t('report.uncoverEarly')}</AppText>
                  </Pressable>
                ) : (
                  <Pressable
                    disabled={!canAdd || coverBusy === day.date}
                    onPress={() =>
                      void onCover({
                        deviceUserId,
                        date: day.date,
                        timestamp: day.exitTime ?? day.date + 'T12:00:00.000',
                        type: 'early_exit',
                      })
                    }
                  >
                    <AppText style={styles.link}>{t('report.coverEarly')}</AppText>
                  </Pressable>
                )
              ) : null}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  tabRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  tabChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  tabChipActive: { backgroundColor: '#ccfbf1' },
  tabText: { fontSize: 11, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#0f766e' },
  perfCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  perfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  perfName: { fontSize: 16, fontWeight: '600', flex: 1, minWidth: 0 },
  balanceTag: { fontSize: 11, fontWeight: '600', color: '#c2410c' },
  perfId: { fontSize: 12, color: '#64748b', marginBottom: 8 },
  pdfBtn: {
    backgroundColor: '#0f766e',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  pdfBtnDisabled: { opacity: 0.6 },
  pdfBtnText: { color: '#fff', fontWeight: '600' },
  error: { color: '#b91c1c', marginBottom: 8 },
  hint: { color: '#64748b', textAlign: 'center', marginTop: 24 },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  loader: { marginVertical: 12 },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 16 },
  dayCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dayDate: { fontSize: 15, fontWeight: '600' },
  tagHoliday: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065f46',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagAbsent: {
    fontSize: 11,
    fontWeight: '600',
    color: '#991b1b',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dayLine: { fontSize: 13, color: '#334155', marginTop: 4 },
  coverRow: { flexDirection: 'row', gap: 16, marginTop: 8 },
  link: { color: '#0f766e', fontWeight: '600', fontSize: 13 },
  linkDanger: { color: '#b91c1c', fontWeight: '600', fontSize: 13 },
});
