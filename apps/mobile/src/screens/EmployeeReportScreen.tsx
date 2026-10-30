import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
import {
  canCoverWithTimeLeave,
  countTimeLeaveForUser,
  remainingLeaveDays,
} from '../attendance/leave-balance';
import {
  attendanceRate,
  averageEntryTime24,
  leaveUsedPercent,
  previousPeriodRange,
  punctualityRate,
  totalLateMinutes,
  trendDeltaPercent,
} from '../attendance/employeeDetailStats';
import { displayName, getQuickRange } from '../attendance/formatters';
import { buildEmployeeDayRows } from '../attendance/report-days';
import { isEmployeeReportPdfRangeValid } from '../attendance/reportRange';
import { buildNameLookup, mergeEmployeesWithPunchIds } from '../attendance/lookups';
import { GlassBackButton } from '../components/employeeDetail/GlassBackButton';
import {
  EmployeeDetailMetricsCard,
  type EmployeeDetailMetrics,
} from '../components/employeeDetail/EmployeeDetailMetricsCard';
import { GlassCircleIconButton } from '../components/daily/GlassCircleIconButton';
import { HomeGlassBackground } from '../components/home/HomeGlassBackground';
import { HOME_BG_DARK, HOME_BG_LIGHT } from '../components/home/homeGlass';
import { NetworkErrorPanel } from '../components/NetworkErrorPanel';
import { RecordsSearchField } from '../components/records/RecordsSearchField';
import { ReportDayRowCard } from '../components/report/ReportDayRowCard';
import { ReportEmployeePickerRow } from '../components/report/ReportEmployeePickerRow';
import { ReportLeaderboardCard } from '../components/report/ReportLeaderboardCard';
import { ReportPerformanceSortChips } from '../components/report/ReportPerformanceSortChips';
import type { PerformanceSortKey } from '../components/report/ReportPerformanceSortChips';
import { ReportRangeChips } from '../components/report/ReportRangeChips';
import { ReportSkeleton } from '../components/report/ReportSkeleton';
import { ReportSummaryTab } from '../components/report/ReportSummaryTab';
import { ReportTabSegment, type ReportTabKey } from '../components/report/ReportTabSegment';
import { sortPerformanceRows } from '../components/report/reportPerformance';
import { TimeLeaveCoverList } from '../components/TimeLeaveCoverList';
import { ViewOnlyBanner } from '../components/ViewOnlyBanner';
import { useCanManageAttendance } from '../hooks/useCanManageAttendance';
import type { MoreStackParamList } from '../navigation/types';
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
import { overviewScrollPaddingBottom } from '../theme/homeTheme';
import { useHomeTheme } from '../theme/HomeThemeProvider';
import { useI18n } from '../i18n/I18nProvider';
import type { AppTypography } from '../i18n/fonts';
import { mirroredRow } from '../ui/rtlLayout';

type Props = NativeStackScreenProps<MoreStackParamList, 'EmployeeReport'>;

export function EmployeeReportScreen({ route, navigation }: Props) {
  const { t } = useTranslation('attendance');
  const canManage = useCanManageAttendance();
  const insets = useSafeAreaInsets();
  const { palette, isDark } = useHomeTheme();
  const { mirrorLayout, typography } = useI18n();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );
  const scrollBottomPad = overviewScrollPaddingBottom(insets.bottom);

  const [tab, setTab] = useState<ReportTabKey>('performance');
  const [search, setSearch] = useState('');
  const [performanceSort, setPerformanceSort] = useState<PerformanceSortKey>('attendance');
  const [performanceRows, setPerformanceRows] = useState<EmployeeReportRow[]>([]);
  const [performanceEarlyTotal, setPerformanceEarlyTotal] = useState(0);
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
  const [prevRowForSelected, setPrevRowForSelected] = useState<EmployeeReportRow | undefined>();
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
  const [exportingAllEmployees, setExportingAllEmployees] = useState(false);
  const [coverBusy, setCoverBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [errorIsNetwork, setErrorIsNetwork] = useState(false);

  const selectedUser = users.find((u) => u.deviceUserId === selectedId);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        RNStatusBar.setTranslucent(true);
        RNStatusBar.setBackgroundColor('transparent');
      }
      setStatusBarStyle(isDark ? 'light' : 'dark');
    }, [isDark]),
  );

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
      setPerformanceEarlyTotal(report.earlyExitOccurrences.length);
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
      setPrevRowForSelected(undefined);
      return;
    }
    try {
      const prev = previousPeriodRange(filter.fromDate, filter.toDate);
      const [report, prevReport] = await Promise.all([
        getEmployeeReport({
          fromDate: filter.fromDate,
          toDate: filter.toDate,
        }),
        getEmployeeReport({
          fromDate: prev.fromDate,
          toDate: prev.toDate,
        }),
      ]);
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
      setPrevRowForSelected(
        prevReport.rows.find((r) => r.deviceUserId === selectedId),
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
    const id = route.params?.deviceUserId?.trim();
    if (!id) return;
    setTab('per-employee');
    setSelectedId(id);
  }, [route.params?.deviceUserId]);

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
    let list = performanceRows;
    if (q) {
      list = list.filter((row) => {
        const name = nameLookup.get(row.deviceUserId) || row.deviceUserId;
        return (
          row.deviceUserId.toLowerCase().includes(q) ||
          name.toLowerCase().includes(q)
        );
      });
    }
    return sortPerformanceRows(list, performanceSort);
  }, [performanceRows, search, nameLookup, performanceSort]);

  const summaryTotals = useMemo(() => {
    return performanceRows.reduce(
      (acc, row) => ({
        present: acc.present + row.workingDaysPresent,
        absent: acc.absent + row.daysAbsent,
        late: acc.late + row.lateCount,
        expected: acc.expected + row.expectedWorkingDays,
      }),
      { present: 0, absent: 0, late: 0, expected: 0 },
    );
  }, [performanceRows]);

  const attendanceRatePct =
    summaryTotals.expected > 0
      ? Math.round((summaryTotals.present / summaryTotals.expected) * 100)
      : 0;

  const punctualityPct = punctualityRate(summaryTotals.present, summaryTotals.late);

  const schoolLeaveUsedPct = useMemo(() => {
    if (!settings || users.length === 0) return 0;
    const annualTotal = settings.annualHolidaysDays * users.length;
    if (annualTotal <= 0) return 0;
    const remaining = balances.reduce((sum, b) => sum + b.balanceDays, 0);
    const used = Math.max(0, annualTotal - remaining);
    return leaveUsedPercent(used, annualTotal);
  }, [settings, users.length, balances]);

  const balanceLookup = useMemo(
    () => new Map(balances.map((b) => [b.deviceUserId, b.balanceDays])),
    [balances],
  );

  const employeeMetrics = useMemo((): EmployeeDetailMetrics | null => {
    if (!reportRow || !selectedId || !settings) return null;
    const present = reportRow.present;
    const expected = reportRow.expected;
    const late = reportRow.late;
    const absent = reportRow.absent;
    const early = reportRow.early;
    const prevPresent = prevRowForSelected?.workingDaysPresent ?? 0;
    const prevExpected = prevRowForSelected?.expectedWorkingDays ?? 0;
    const prevLate = prevRowForSelected?.lateCount ?? 0;
    const attPct = attendanceRate(present, expected);
    const prevAttPct = attendanceRate(prevPresent, prevExpected);
    const punctPct = punctualityRate(present, late);
    const leaveRemaining = remainingLeaveDays(
      selectedId,
      {
        tempHolidaysPerFullHoliday: settings.tempHolidaysPerFullHoliday,
        annualHolidaysDays: settings.annualHolidaysDays,
      },
      balances,
      timeLeaveUsage,
      employeeHolidays,
    );
    const tempLeaveCount = countTimeLeaveForUser(selectedId, timeLeaveUsage);
    const annual = settings.annualHolidaysDays;
    const leaveUsed = Math.max(0, annual - leaveRemaining);

    return {
      present,
      expected,
      late,
      early,
      absent,
      avgEntry: averageEntryTime24(records),
      leaveRemaining,
      tempLeaveCount,
      lateMinutes: totalLateMinutes(
        records,
        selectedUser,
        settings.shiftStartTime,
      ),
      attendancePct: attPct,
      punctualityPct: punctPct,
      leaveUsedPct: leaveUsedPercent(leaveUsed, annual),
      trendAttendancePct: trendDeltaPercent(attPct, prevAttPct),
      trendLatePct: trendDeltaPercent(late, prevLate),
    };
  }, [
    reportRow,
    selectedId,
    settings,
    prevRowForSelected,
    balances,
    timeLeaveUsage,
    employeeHolidays,
    records,
    selectedUser,
  ]);

  function assertPdfRangeOrSetError(): boolean {
    if (!isEmployeeReportPdfRangeValid(filter.fromDate, filter.toDate)) {
      setError(t('report.pdfRangeTooLong'));
      setErrorIsNetwork(false);
      return false;
    }
    return true;
  }

  async function handlePdf() {
    if (tab === 'per-employee' && !selectedId) {
      setError(t('report.selectEmployeeFirst'));
      return;
    }
    if (!assertPdfRangeOrSetError()) return;
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

  async function handleAllEmployeesPdf() {
    if (!assertPdfRangeOrSetError()) return;
    setExportingAllEmployees(true);
    setError('');
    try {
      await shareAttendanceReportPdf({
        type: 'per-employee-all',
        fromDate: filter.fromDate,
        toDate: filter.toDate,
      });
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'report.pdfError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
    } finally {
      setExportingAllEmployees(false);
    }
  }

  function punchLabel(type: PunchType | null | undefined) {
    if (!type) return '–';
    return t(`punchTypes.${type}`);
  }

  const tabs = useMemo(
    () => [
      { key: 'performance' as const, label: t('report.tabs.performance') },
      { key: 'per-employee' as const, label: t('report.tabs.perEmployee') },
      { key: 'summary' as const, label: t('report.tabs.summary') },
    ],
    [t],
  );

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

  function openEmployeeDetail(deviceUserId: string, name: string) {
    navigation.navigate('EmployeeDetail', { deviceUserId, name });
  }

  const listHeader = (
    <View style={[styles.headerBlock, { paddingTop: insets.top }]}>
      {!canManage ? (
        <View style={styles.bannerWrap}>
          <ViewOnlyBanner />
        </View>
      ) : null}

      <View style={[styles.topRow, mirroredRow(mirrorLayout)]}>
        <GlassBackButton onPress={() => navigation.goBack()} />
        <Text style={styles.screenTitle} numberOfLines={1}>
          {t('tabs.report')}
        </Text>
      </View>

      <ReportTabSegment
        tabs={tabs}
        value={tab}
        onChange={setTab}
        trailing={
          <GlassCircleIconButton
            icon="download-outline"
            onPress={() => void handlePdf()}
            loading={exporting}
            disabled={exporting || (tab === 'per-employee' && !selectedId)}
            accessibilityLabel={t('report.generatePdf')}
          />
        }
      />
      <ReportRangeChips filter={filter} onChange={setFilter} />

      {errorIsNetwork ? (
        <NetworkErrorPanel message={error} onRetry={retryAll} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      {showContentLoading ? (
        <ReportSkeleton variant={tab} />
      ) : tab === 'performance' ? (
        <>
          <RecordsSearchField
            value={search}
            onChangeText={setSearch}
            placeholder={t('report.searchPlaceholder')}
          />
          <ReportPerformanceSortChips value={performanceSort} onChange={setPerformanceSort} />
        </>
      ) : null}
    </View>
  );

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        setPerfReady(false);
        void Promise.all([loadMeta(), loadPerformanceReport()]).then(() => {
          if (tab === 'per-employee' && selectedId) {
            setEmployeeReady(false);
            void Promise.all([loadReport(), loadRecords()]).then(() =>
              setEmployeeReady(true),
            );
          }
        });
      }}
      tintColor={palette.teal}
    />
  );

  return (
    <View style={styles.root}>
      <HomeGlassBackground isDark={isDark} />
      <SafeAreaView style={styles.safe} edges={[]}>
        {tab === 'performance' && !showContentLoading ? (
          <FlatList
            data={filteredPerformance}
            keyExtractor={(item) => item.deviceUserId}
            style={styles.list}
            contentContainerStyle={[
              styles.scroll,
              { paddingBottom: scrollBottomPad },
              filteredPerformance.length === 0 && styles.listEmptyGrow,
            ]}
            ListHeaderComponent={listHeader}
            ListEmptyComponent={
              <Text style={styles.empty}>{t('report.empty')}</Text>
            }
            refreshControl={refreshControl}
            renderItem={() => null}
            ListFooterComponent={
              filteredPerformance.length > 0 ? (
                <ReportLeaderboardCard
                  rows={filteredPerformance}
                  nameLookup={nameLookup}
                  balanceLookup={balanceLookup}
                  onPressRow={openEmployeeDetail}
                />
              ) : null
            }
          />
        ) : (
          <FlatList
            data={[]}
            renderItem={() => null}
            style={styles.list}
            contentContainerStyle={[
              styles.scroll,
              { paddingBottom: scrollBottomPad },
            ]}
            ListHeaderComponent={listHeader}
            refreshControl={refreshControl}
            ListFooterComponent={
              showContentLoading ? null : tab === 'summary' ? (
                <ReportSummaryTab
                  rows={performanceRows}
                  nameLookup={nameLookup}
                  attendancePct={attendanceRatePct}
                  punctualityPct={punctualityPct}
                  leaveUsedPct={schoolLeaveUsedPct}
                  totals={{
                    present: summaryTotals.present,
                    late: summaryTotals.late,
                    absent: summaryTotals.absent,
                    early: performanceEarlyTotal,
                  }}
                  onPressEmployee={openEmployeeDetail}
                />
              ) : tab === 'per-employee' && !selectedId ? (
                <Text style={styles.hint}>{t('report.selectEmployeeHint')}</Text>
              ) : tab === 'per-employee' ? (
                <View style={styles.perEmployeeBody}>
                  <View style={styles.perEmployeePickerRow}>
                    <View style={styles.perEmployeePickerFlex}>
                      <ReportEmployeePickerRow
                        users={users}
                        value={selectedId}
                        onChange={setSelectedId}
                      />
                    </View>
                    <Pressable
                      onPress={() => void handleAllEmployeesPdf()}
                      disabled={exportingAllEmployees || exporting}
                      style={({ pressed }) => [
                        styles.allEmployeesPdfBtn,
                        (pressed || exportingAllEmployees) && styles.allEmployeesPdfBtnPressed,
                        (exportingAllEmployees || exporting) && styles.allEmployeesPdfBtnDisabled,
                      ]}
                      accessibilityRole="button"
                    >
                      <Text style={styles.allEmployeesPdfBtnText} numberOfLines={2}>
                        {exportingAllEmployees
                          ? t('report.pdfPreparing')
                          : t('report.allEmployeesPdf')}
                      </Text>
                    </Pressable>
                  </View>
                  {employeeMetrics ? (
                    <EmployeeDetailMetricsCard metrics={employeeMetrics} />
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
                  {dayRows.length === 0 ? (
                    <Text style={styles.empty}>{t('report.emptyDays')}</Text>
                  ) : (
                    dayRows.map((day) => (
                      <ReportDayRowCard
                        key={day.date}
                        day={day}
                        deviceUserId={selectedId}
                        canManage={canManage}
                        canAdd={canAddCover(selectedId)}
                        coverBusy={coverBusy}
                        timeLeaveUsage={timeLeaveUsage}
                        t={t}
                        punchLabel={punchLabel}
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
                    ))
                  )}
                </View>
              ) : null
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const muted = isDark ? '#94A3B8' : '#64748B';

  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: isDark ? HOME_BG_DARK : HOME_BG_LIGHT,
    },
    safe: { flex: 1, backgroundColor: 'transparent' },
    list: { flex: 1, backgroundColor: 'transparent' },
    scroll: {
      paddingHorizontal: 16,
      gap: 16,
    },
    listEmptyGrow: { flexGrow: 1 },
    headerBlock: { gap: 16, marginBottom: 4 },
    bannerWrap: { marginBottom: -8 },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    screenTitle: {
      flex: 1,
      fontFamily: typography.noto.bold,
      fontSize: 20,
      lineHeight: 28,
      color: text,
      minWidth: 0,
    },
    error: {
      fontFamily: typography.noto.medium,
      fontSize: 14,
      color: '#EF4444',
    },
    empty: {
      textAlign: 'center',
      color: muted,
      marginTop: 16,
      fontFamily: typography.noto.medium,
      fontSize: 15,
    },
    hint: {
      color: muted,
      textAlign: 'center',
      marginTop: 24,
      fontFamily: typography.noto.medium,
      fontSize: 15,
    },
    perEmployeeBody: { gap: 16, marginTop: 4 },
    perEmployeePickerRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: 10,
    },
    perEmployeePickerFlex: { flex: 1, minWidth: 0 },
    allEmployeesPdfBtn: {
      alignSelf: 'center',
      maxWidth: 120,
      paddingHorizontal: 12,
      paddingVertical: 14,
      borderRadius: 14,
      backgroundColor: isDark ? 'rgba(20, 184, 166, 0.22)' : 'rgba(20, 184, 166, 0.12)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(20, 184, 166, 0.45)' : 'rgba(20, 184, 166, 0.35)',
    },
    allEmployeesPdfBtnPressed: { opacity: 0.88 },
    allEmployeesPdfBtnDisabled: { opacity: 0.55 },
    allEmployeesPdfBtnText: {
      fontFamily: typography.noto.bold,
      fontSize: 12,
      lineHeight: 17,
      textAlign: 'center',
      color: '#0D9488',
    },
  });
}
