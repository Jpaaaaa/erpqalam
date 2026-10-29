import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { navigateToMoreStackScreen } from '../navigation/nestedTabNavigation';
import { setStatusBarStyle } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { resolveUserFacingError } from '../api/client';
import {
  getAttendanceSettings,
  getDailyReport,
  getEmployeeReport,
  listAttendanceDevices,
  listAttendanceRecords,
  listAttendanceUsers,
  listEmployeeHolidays,
  listLeaveBalances,
  listTimeLeaveUsage,
} from '../api/attendance';
import {
  attendanceRate,
  averageEntryTime24,
  leaveUsedPercent,
  previousPeriodRange,
  punctualityRate,
  totalLateMinutes,
  trendDeltaPercent,
} from '../attendance/employeeDetailStats';
import { getQuickRange, todayDateKey } from '../attendance/formatters';
import { buildDeviceNameLookup } from '../attendance/lookups';
import {
  countTimeLeaveForUser,
  remainingLeaveDays,
} from '../attendance/leave-balance';
import { NetworkErrorPanel } from '../components/NetworkErrorPanel';
import { EmployeeDetailBottomActions } from '../components/employeeDetail/EmployeeDetailBottomActions';
import { EmployeeDetailHero } from '../components/employeeDetail/EmployeeDetailHero';
import {
  EmployeeDetailMetricsCard,
  type EmployeeDetailMetrics,
} from '../components/employeeDetail/EmployeeDetailMetricsCard';
import { EmployeeDetailRangeChips } from '../components/employeeDetail/EmployeeDetailRangeChips';
import { EmployeeDetailSkeleton } from '../components/employeeDetail/EmployeeDetailSkeleton';
import { EmployeeDetailTimeline } from '../components/employeeDetail/EmployeeDetailTimeline';
import { GlassBackButton } from '../components/employeeDetail/GlassBackButton';
import { HomeGlassBackground } from '../components/home/HomeGlassBackground';
import { HOME_BG_DARK, HOME_BG_LIGHT } from '../components/home/homeGlass';
import type {
  AttendanceRecord,
  AttendanceSettings,
  AttendanceUser,
  DailyAttendanceRow,
  DateFilter,
} from '../types/attendance';
import { EmployeeDetailCustomSchedule } from '../components/employeeDetail/EmployeeDetailCustomSchedule';
import type { EmployeeDetailProps } from '../navigation/types';
import type { MainTabParamList } from '../navigation/types';
import { overviewScrollPaddingBottom } from '../theme/homeTheme';
import { useHomeTheme } from '../theme/HomeThemeProvider';
import { useCanManageAttendance } from '../hooks/useCanManageAttendance';
import { useI18n } from '../i18n/I18nProvider';
import type { AppTypography } from '../i18n/fonts';
import { AppText } from '../ui/AppText';
import { mirroredRow } from '../ui/rtlLayout';

export function EmployeeDetailScreen({ route, navigation }: EmployeeDetailProps) {
  const { t } = useTranslation();
  const { deviceUserId, name } = route.params;
  const canManage = useCanManageAttendance();
  const insets = useSafeAreaInsets();
  const { palette, isDark } = useHomeTheme();
  const { mirrorLayout, typography } = useI18n();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );
  const scrollBottomPad = overviewScrollPaddingBottom(insets.bottom) + 8;

  const tabNavigation =
    navigation.getParent()?.getParent<BottomTabNavigationProp<MainTabParamList>>() ??
    navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();

  const [filter, setFilter] = useState<DateFilter>(() => {
    const month = getQuickRange('month');
    return { fromDate: month.from, toDate: month.to };
  });
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [, setDeviceNames] = useState<Map<string, string>>(new Map());
  const [todayRow, setTodayRow] = useState<DailyAttendanceRow | undefined>();
  const [metrics, setMetrics] = useState<EmployeeDetailMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [errorIsNetwork, setErrorIsNetwork] = useState(false);
  const [globalSettings, setGlobalSettings] = useState<AttendanceSettings | null>(
    null,
  );
  const [attendanceUser, setAttendanceUser] = useState<AttendanceUser | undefined>();

  const load = useCallback(async () => {
    setError('');
    try {
      const prev = previousPeriodRange(filter.fromDate, filter.toDate);
      const today = todayDateKey();
      const [
        rows,
        devices,
        report,
        prevReport,
        dailyToday,
        settingsRow,
        balances,
        timeLeave,
        empHolidays,
        users,
      ] = await Promise.all([
        listAttendanceRecords({
          fromDate: filter.fromDate,
          toDate: filter.toDate,
          deviceUserId,
          limit: 5000,
        }),
        listAttendanceDevices(),
        getEmployeeReport({
          fromDate: filter.fromDate,
          toDate: filter.toDate,
        }),
        getEmployeeReport({
          fromDate: prev.fromDate,
          toDate: prev.toDate,
        }),
        getDailyReport(today),
        getAttendanceSettings(),
        listLeaveBalances(),
        listTimeLeaveUsage(),
        listEmployeeHolidays(),
        listAttendanceUsers(),
      ]);

      setRecords(rows);
      setDeviceNames(buildDeviceNameLookup(devices));
      setGlobalSettings(settingsRow);
      setAttendanceUser(users.find((u) => u.deviceUserId === deviceUserId));
      setTodayRow(dailyToday.rows.find((r) => r.deviceUserId === deviceUserId));

      const row = report.rows.find((r) => r.deviceUserId === deviceUserId);
      const prevRow = prevReport.rows.find((r) => r.deviceUserId === deviceUserId);
      const present = row?.workingDaysPresent ?? 0;
      const expected = row?.expectedWorkingDays ?? 0;
      const late = row?.lateCount ?? 0;
      const absent = row?.daysAbsent ?? 0;
      const early = report.earlyExitOccurrences.filter(
        (o) => o.deviceUserId === deviceUserId,
      ).length;

      const prevPresent = prevRow?.workingDaysPresent ?? 0;
      const prevExpected = prevRow?.expectedWorkingDays ?? 0;
      const prevLate = prevRow?.lateCount ?? 0;

      const attPct = attendanceRate(present, expected);
      const prevAttPct = attendanceRate(prevPresent, prevExpected);
      const punctPct = punctualityRate(present, late);

      const leaveCtx = {
        tempHolidaysPerFullHoliday: settingsRow.tempHolidaysPerFullHoliday,
        annualHolidaysDays: settingsRow.annualHolidaysDays,
      };
      const leaveRemaining = remainingLeaveDays(
        deviceUserId,
        leaveCtx,
        balances,
        timeLeave,
        empHolidays,
      );
      const tempLeaveCount = countTimeLeaveForUser(deviceUserId, timeLeave);
      const annual = settingsRow.annualHolidaysDays;
      const leaveUsed = Math.max(0, annual - leaveRemaining);

      setMetrics({
        present,
        expected,
        late,
        early,
        absent,
        avgEntry: averageEntryTime24(rows),
        leaveRemaining,
        tempLeaveCount,
        lateMinutes: totalLateMinutes(
          rows,
          users.find((u) => u.deviceUserId === deviceUserId),
          settingsRow.shiftStartTime,
        ),
        attendancePct: attPct,
        punctualityPct: punctPct,
        leaveUsedPct: leaveUsedPercent(leaveUsed, annual),
        trendAttendancePct: trendDeltaPercent(attPct, prevAttPct),
        trendLatePct: trendDeltaPercent(late, prevLate),
      });
    } catch (err) {
      const resolved = resolveUserFacingError(
        err,
        t,
        'attendance:records.loadError',
      );
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [deviceUserId, filter.fromDate, filter.toDate, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        RNStatusBar.setTranslucent(true);
        RNStatusBar.setBackgroundColor('transparent');
      }
      setStatusBarStyle(isDark ? 'light' : 'dark');
      return () => {
        if (Platform.OS === 'android') {
          RNStatusBar.setTranslucent(false);
          RNStatusBar.setBackgroundColor(isDark ? HOME_BG_DARK : HOME_BG_LIGHT);
        }
        setStatusBarStyle('dark');
      };
    }, [isDark]),
  );

  const listHeader = (
    <View style={[styles.headerBlock, { paddingTop: insets.top }]}>
      <View style={[styles.topRow, mirroredRow(mirrorLayout)]}>
        <GlassBackButton onPress={() => navigation.goBack()} />
        <Text style={styles.navTitle} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.topSpacer} />
      </View>

      <EmployeeDetailHero
        name={name}
        deviceUserId={deviceUserId}
        todayRow={todayRow}
      />

      <EmployeeDetailRangeChips filter={filter} onChange={setFilter} />

      {errorIsNetwork ? (
        <NetworkErrorPanel message={error} onRetry={() => void load()} />
      ) : error ? (
        <AppText style={styles.error}>{error}</AppText>
      ) : null}

      {loading && !metrics ? (
        <EmployeeDetailSkeleton />
      ) : metrics ? (
        <>
          <EmployeeDetailMetricsCard metrics={metrics} />
          {canManage && globalSettings ? (
            <EmployeeDetailCustomSchedule
              deviceUserId={deviceUserId}
              user={attendanceUser}
              globalSettings={globalSettings}
              onSaved={() => void load()}
            />
          ) : null}
          {records.length > 0 ? (
            <EmployeeDetailTimeline records={records} />
          ) : (
            <View style={styles.emptyWrap}>
              <AppText style={styles.empty}>{t('attendance:records.empty')}</AppText>
            </View>
          )}
          <EmployeeDetailBottomActions
            canManage={canManage}
            onFullReport={() => {
              if (tabNavigation) {
                navigateToMoreStackScreen(tabNavigation, 'EmployeeReport', {
                  deviceUserId,
                });
              }
            }}
            onManualPunch={() => {
              navigation.navigate('ManualPunch', { deviceUserId });
            }}
          />
        </>
      ) : null}
    </View>
  );

  return (
    <View style={styles.root}>
      <HomeGlassBackground isDark={isDark} />
      <SafeAreaView style={styles.safe} edges={[]}>
        <FlatList
          data={[{ key: 'main' }]}
          keyExtractor={(item) => item.key}
          style={styles.list}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: scrollBottomPad },
          ]}
          ListHeaderComponent={listHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void load();
              }}
              tintColor={palette.teal}
            />
          }
          renderItem={() => null}
        />
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
    scrollContent: { paddingHorizontal: 16 },
    headerBlock: { gap: 16, paddingBottom: 8 },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    navTitle: {
      flex: 1,
      fontFamily: typography.noto.bold,
      fontSize: 16,
      lineHeight: 24,
      color: text,
      textAlign: 'center',
    },
    topSpacer: { width: 40 },
    error: { color: '#EF4444' },
    emptyWrap: { paddingVertical: 24, alignItems: 'center' },
    empty: {
      fontFamily: typography.noto.medium,
      fontSize: 14,
      color: muted,
      textAlign: 'center',
    },
  });
}
