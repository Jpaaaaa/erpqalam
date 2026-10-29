import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
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
import { setStatusBarStyle } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { resolveUserFacingError } from '../api/client';
import { DateRangeChips } from '../components/DateRangeChips';
import { NetworkErrorPanel } from '../components/NetworkErrorPanel';
import {
  addEmployeeHoliday,
  addEmployeeHolidayRange,
  addHoliday,
  addHolidayRange,
  addTimeLeaveUsage,
  getAttendanceSettings,
  getEmployeeReport,
  listAttendanceRecords,
  listEmployeeHolidays,
  listHolidays,
  listAttendanceUsers,
  listLeaveBalances,
  listTimeLeaveUsage,
  removeEmployeeHoliday,
  removeHoliday,
  setLeaveBalance,
  updateAttendanceSettings,
} from '../api/attendance';
import { formatHolidayDateRangeWords } from '../attendance/holidayFormatters';
import {
  groupEmployeeLeaveByUser,
  groupOfficialHolidayRanges,
  upcomingOfficialRanges,
} from '../attendance/holidayRanges';
import { getQuickRange, isValidDateKey, todayDateKey } from '../attendance/formatters';
import { buildNameLookup, mergeEmployeesWithPunchIds } from '../attendance/lookups';
import { GlassBackButton } from '../components/employeeDetail/GlassBackButton';
import { RecordsFab } from '../components/records/RecordsFab';
import { HolidaysAddSheet } from '../components/holidays/HolidaysAddSheet';
import { HolidaysCoverListCard } from '../components/holidays/HolidaysCoverListCard';
import { HolidaysEmployeeListCard } from '../components/holidays/HolidaysEmployeeListCard';
import { HolidaysEmptyState } from '../components/holidays/HolidaysEmptyState';
import { HolidaysMonthCalendar } from '../components/holidays/HolidaysMonthCalendar';
import { HolidaysOfficialList } from '../components/holidays/HolidaysOfficialList';
import { HolidaysSettingsCard } from '../components/holidays/HolidaysSettingsCard';
import { HolidaysSkeleton } from '../components/holidays/HolidaysSkeleton';
import {
  HolidaysTabSegment,
  type HolidaysTabKey,
} from '../components/holidays/HolidaysTabSegment';
import { ViewOnlyBanner } from '../components/ViewOnlyBanner';
import { useCanManageAttendance } from '../hooks/useCanManageAttendance';
import type { MoreStackParamList } from '../navigation/types';
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
} from '../types/attendance';
import { overviewScrollPaddingBottom } from '../theme/homeTheme';
import { useHomeTheme } from '../theme/HomeThemeProvider';
import { useI18n } from '../i18n/I18nProvider';
import type { AppTypography } from '../i18n/fonts';
import { mirroredRow } from '../ui/rtlLayout';
import { HomeGlassBackground } from '../components/home/HomeGlassBackground';
import { HOME_BG_DARK, HOME_BG_LIGHT } from '../components/home/homeGlass';

type Props = NativeStackScreenProps<MoreStackParamList, 'Holidays'>;

export function HolidaysScreen({ navigation }: Props) {
  const { t } = useTranslation('attendance');
  const canManage = useCanManageAttendance();
  const insets = useSafeAreaInsets();
  const { palette, isDark } = useHomeTheme();
  const { locale, mirrorLayout, typography } = useI18n();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );
  const scrollBottomPad = overviewScrollPaddingBottom(insets.bottom) + 16;

  const [errorIsNetwork, setErrorIsNetwork] = useState(false);
  const [tab, setTab] = useState<HolidaysTabKey>('official');
  const [holidays, setHolidays] = useState<AttendanceHoliday[]>([]);
  const [employeeHolidays, setEmployeeHolidays] = useState<EmployeeHoliday[]>([]);
  const [users, setUsers] = useState<AttendanceUser[]>([]);
  const [settings, setSettings] = useState<AttendanceSettings | null>(null);
  const [timeLeave, setTimeLeave] = useState<TimeLeaveUsage[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [coverRecords, setCoverRecords] = useState<AttendanceRecord[]>([]);
  const [lateOccurrences, setLateOccurrences] = useState<
    { deviceUserId: string; date: string }[]
  >([]);
  const [earlyOccurrences, setEarlyOccurrences] = useState<
    { deviceUserId: string; date: string; timestamp: string }[]
  >([]);
  const [coverFilter, setCoverFilter] = useState<DateFilter>(() => {
    const month = getQuickRange('month');
    return { fromDate: month.from, toDate: month.to };
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [calendarSelection, setCalendarSelection] = useState<{
    date: string;
    type: AttendanceHolidayType | null;
  } | null>(null);

  const [orgType, setOrgType] = useState<AttendanceHolidayType>('day_off');
  const [orgFrom, setOrgFrom] = useState('');
  const [orgTo, setOrgTo] = useState('');

  const [empUserId, setEmpUserId] = useState('');
  const [empFrom, setEmpFrom] = useState('');
  const [empTo, setEmpTo] = useState('');

  const [annualDays, setAnnualDays] = useState(7);
  const [tempRatio, setTempRatio] = useState(3);
  const [balanceUserId, setBalanceUserId] = useState('');
  const [balanceDays, setBalanceDays] = useState(7);

  const nameLookup = useMemo(
    () => buildNameLookup(mergeEmployeesWithPunchIds(users, coverRecords)),
    [users, coverRecords],
  );

  const balanceLookup = useMemo(
    () => new Map(balances.map((b) => [b.deviceUserId, b.balanceDays])),
    [balances],
  );

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        RNStatusBar.setTranslucent(true);
        RNStatusBar.setBackgroundColor('transparent');
      }
      setStatusBarStyle(isDark ? 'light' : 'dark');
    }, [isDark]),
  );

  const loadCore = useCallback(async () => {
    setError('');
    setErrorIsNetwork(false);
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
      const resolved = resolveUserFacingError(err, t, 'holidays.loadError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  const loadCoverData = useCallback(async () => {
    try {
      const [report, records] = await Promise.all([
        getEmployeeReport({
          fromDate: coverFilter.fromDate,
          toDate: coverFilter.toDate,
        }),
        listAttendanceRecords({
          fromDate: coverFilter.fromDate,
          toDate: coverFilter.toDate,
          limit: 5000,
        }),
      ]);
      setLateOccurrences(report.lateOccurrences);
      setEarlyOccurrences(report.earlyExitOccurrences);
      setCoverRecords(records);
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'holidays.loadError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
    }
  }, [coverFilter.fromDate, coverFilter.toDate, t]);

  useEffect(() => {
    void loadCore();
  }, [loadCore]);

  useEffect(() => {
    if (tab === 'temporary') void loadCoverData();
  }, [tab, loadCoverData]);

  async function refreshAfterMutation() {
    await loadCore();
    if (tab === 'temporary') await loadCoverData();
  }

  async function handleAddOrg() {
    if (!canManage || !isValidDateKey(orgFrom)) return;
    setError('');
    setSuccess('');
    const to = orgTo && isValidDateKey(orgTo) ? orgTo : orgFrom;
    try {
      if (to !== orgFrom) {
        await addHolidayRange({ dateFrom: orgFrom, dateTo: to, type: orgType });
      } else {
        await addHoliday({ date: orgFrom, type: orgType });
      }
      setSuccess(t('holidays.orgAdded'));
      setOrgFrom('');
      setOrgTo('');
      setAddSheetOpen(false);
      await refreshAfterMutation();
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'holidays.saveError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
    }
  }

  async function handleAddEmp() {
    if (!canManage || !empUserId || !isValidDateKey(empFrom)) return;
    setError('');
    setSuccess('');
    const to = empTo && isValidDateKey(empTo) ? empTo : empFrom;
    try {
      if (to !== empFrom) {
        await addEmployeeHolidayRange({
          deviceUserId: empUserId,
          dateFrom: empFrom,
          dateTo: to,
        });
      } else {
        await addEmployeeHoliday({ deviceUserId: empUserId, date: empFrom });
      }
      setSuccess(t('holidays.empAdded'));
      setEmpFrom('');
      setEmpTo('');
      setAddSheetOpen(false);
      await refreshAfterMutation();
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'holidays.saveError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
    }
  }

  async function handleSaveLeaveConfig() {
    if (!canManage) return;
    setError('');
    setSuccess('');
    try {
      await updateAttendanceSettings({
        annualHolidaysDays: annualDays,
        tempHolidaysPerFullHoliday: tempRatio,
      });
      setSuccess(t('holidays.configSaved'));
      await refreshAfterMutation();
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'holidays.saveError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
    }
  }

  async function handleSetBalance() {
    if (!canManage || !balanceUserId.trim()) return;
    setError('');
    setSuccess('');
    try {
      await setLeaveBalance(balanceUserId.trim(), balanceDays);
      setSuccess(t('holidays.balanceSaved'));
      setAddSheetOpen(false);
      await refreshAfterMutation();
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'holidays.saveError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
    }
  }

  async function handleSetBalanceRow(deviceUserId: string, days: number) {
    if (!canManage) return;
    try {
      await setLeaveBalance(deviceUserId, days);
      await refreshAfterMutation();
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'holidays.saveError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
    }
  }

  async function deleteOfficialIds(ids: string[]) {
    for (const id of ids) {
      await removeHoliday(id);
    }
    await refreshAfterMutation();
  }

  async function deleteEmployeeIds(ids: string[]) {
    for (const id of ids) {
      await removeEmployeeHoliday(id);
    }
    await refreshAfterMutation();
  }

  const tabItems = useMemo(
    () => [
      { key: 'official' as const, label: t('holidays.subtabs.official') },
      { key: 'employee' as const, label: t('holidays.subtabs.employee') },
      { key: 'temporary' as const, label: t('holidays.subtabs.temporary') },
      { key: 'settings' as const, label: t('holidays.subtabs.settings') },
    ],
    [t],
  );

  const officialRanges = useMemo(
    () => upcomingOfficialRanges(groupOfficialHolidayRanges(holidays), todayDateKey()),
    [holidays],
  );

  const employeeGroups = useMemo(
    () => groupEmployeeLeaveByUser(employeeHolidays),
    [employeeHolidays],
  );

  const showSkeleton = loading && !settings;

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
          {t('holidays.screenTitle')}
        </Text>
        <View style={styles.topSpacer} />
      </View>

      <HolidaysTabSegment tabs={tabItems} value={tab} onChange={setTab} />

      {errorIsNetwork ? (
        <NetworkErrorPanel
          message={error}
          onRetry={() => {
            void loadCore();
            if (tab === 'temporary') void loadCoverData();
          }}
        />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      {showSkeleton ? <HolidaysSkeleton /> : null}
    </View>
  );

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={() => {
        setRefreshing(true);
        void refreshAfterMutation();
      }}
      tintColor={palette.teal}
    />
  );

  function renderTabBody() {
    if (showSkeleton) return null;

    if (tab === 'official') {
      return (
        <View style={styles.tabBody}>
          <HolidaysMonthCalendar
            holidays={holidays}
            selectedDate={calendarSelection?.date ?? null}
            onSelectDate={(dateKey, type) => {
              setCalendarSelection({ date: dateKey, type });
            }}
          />
          {calendarSelection?.type ? (
            <View style={styles.dayDetail}>
              <Text style={styles.dayDetailDate}>
                {formatHolidayDateRangeWords(
                  locale,
                  calendarSelection.date,
                  calendarSelection.date,
                )}
              </Text>
              <Text style={styles.dayDetailType}>
                {t(`holidays.types.${calendarSelection.type}`)}
              </Text>
            </View>
          ) : null}
          {officialRanges.length === 0 ? (
            <HolidaysEmptyState message={t('holidays.emptyOfficial')} />
          ) : (
            <HolidaysOfficialList
              ranges={officialRanges}
              canManage={canManage}
              onDeleteRange={deleteOfficialIds}
            />
          )}
        </View>
      );
    }

    if (tab === 'employee') {
      return employeeGroups.length === 0 ? (
        <HolidaysEmptyState message={t('holidays.noEmp')} />
      ) : (
        <HolidaysEmployeeListCard
          groups={employeeGroups}
          nameLookup={nameLookup}
          balanceLookup={balanceLookup}
          canManage={canManage}
          onDeleteIds={deleteEmployeeIds}
        />
      );
    }

    if (tab === 'temporary' && settings) {
      const hasCover =
        lateOccurrences.length > 0 || earlyOccurrences.length > 0;
      return (
        <View style={styles.tabBody}>
          <DateRangeChips filter={coverFilter} onChange={setCoverFilter} />
          {!hasCover ? (
            <HolidaysEmptyState message={t('holidays.noUncoveredLate')} />
          ) : (
            <HolidaysCoverListCard
              lateOccurrences={lateOccurrences}
              earlyExitOccurrences={earlyOccurrences}
              records={coverRecords}
              settings={settings}
              timeLeaveUsage={timeLeave}
              leaveBalances={balances}
              employeeHolidays={employeeHolidays}
              nameLookup={nameLookup}
              canManage={canManage}
              onCover={async (payload) => {
                await addTimeLeaveUsage(payload);
                await refreshAfterMutation();
              }}
            />
          )}
        </View>
      );
    }

    if (tab === 'settings') {
      return (
        <HolidaysSettingsCard
          annualDays={annualDays}
          tempRatio={tempRatio}
          onAnnualChange={setAnnualDays}
          onTempRatioChange={setTempRatio}
          onSaveConfig={() => void handleSaveLeaveConfig()}
          canManage={canManage}
          balances={balances}
          users={users}
          nameLookup={nameLookup}
          onSetBalance={(id, days) => void handleSetBalanceRow(id, days)}
        />
      );
    }

    return null;
  }

  const showFab =
    canManage && tab !== 'temporary';

  return (
    <View style={styles.root}>
      <HomeGlassBackground isDark={isDark} />
      <SafeAreaView style={styles.safe} edges={[]}>
        <FlatList
          data={[]}
          renderItem={() => null}
          style={styles.list}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: scrollBottomPad },
          ]}
          ListHeaderComponent={
            <>
              {listHeader}
              {!showSkeleton ? renderTabBody() : null}
            </>
          }
          refreshControl={refreshControl}
        />
      </SafeAreaView>

      {showFab ? (
        <RecordsFab onPress={() => setAddSheetOpen(true)} />
      ) : null}

      <HolidaysAddSheet
        visible={addSheetOpen}
        tab={tab}
        onClose={() => setAddSheetOpen(false)}
        orgType={orgType}
        onOrgTypeChange={setOrgType}
        orgFrom={orgFrom}
        orgTo={orgTo}
        onOrgFromChange={setOrgFrom}
        onOrgToChange={setOrgTo}
        onSubmitOrg={() => void handleAddOrg()}
        users={users}
        empUserId={empUserId}
        onEmpUserIdChange={setEmpUserId}
        empFrom={empFrom}
        empTo={empTo}
        onEmpFromChange={setEmpFrom}
        onEmpToChange={setEmpTo}
        onSubmitEmp={() => void handleAddEmp()}
        balanceUserId={balanceUserId}
        onBalanceUserIdChange={setBalanceUserId}
        balanceDays={balanceDays}
        onBalanceDaysChange={setBalanceDays}
        onSubmitBalance={() => void handleSetBalance()}
      />
    </View>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';

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
    headerBlock: { gap: 16, marginBottom: 4 },
    bannerWrap: { marginBottom: -8 },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    topSpacer: { width: 40 },
    screenTitle: {
      flex: 1,
      fontFamily: typography.noto.bold,
      fontSize: 20,
      lineHeight: 28,
      color: text,
      textAlign: 'center',
    },
    error: {
      fontFamily: typography.noto.medium,
      fontSize: 14,
      color: '#EF4444',
    },
    success: {
      fontFamily: typography.noto.medium,
      fontSize: 14,
      color: '#059669',
    },
    tabBody: { gap: 16 },
    dayDetail: {
      paddingHorizontal: 4,
      gap: 4,
    },
    dayDetailDate: {
      fontFamily: typography.inter.semibold,
      fontSize: 14,
      color: isDark ? '#94A3B8' : '#64748B',
      fontVariant: ['tabular-nums'],
    },
    dayDetailType: {
      fontFamily: typography.noto.bold,
      fontSize: 16,
      color: text,
    },
  });
}
