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
import {
  getDailyReport,
  listAttendanceUsers,
  shareAttendanceReportPdf,
} from '../api/attendance';
import { filterDailyAttentionRows } from '../attendance/daily-attention';
import {
  matchesDailyStatusFilter,
  type DailyStatusFilter,
} from '../attendance/dailyFilters';
import { isNonWorkingSchoolDay } from '../attendance/dailyWeek';
import { displayName, todayDateKey } from '../attendance/formatters';
import { buildNameLookup, mergeEmployeesWithPunchIds } from '../attendance/lookups';
import { DailyEmptyState } from '../components/daily/DailyEmptyState';
import { DailyFilterChips } from '../components/daily/DailyFilterChips';
import { DailyListCard } from '../components/daily/DailyListCard';
import { DailySkeleton } from '../components/daily/DailySkeleton';
import { DailySummaryCard } from '../components/daily/DailySummaryCard';
import { DailyWeekStrip } from '../components/daily/DailyWeekStrip';
import { GlassCircleIconButton } from '../components/daily/GlassCircleIconButton';
import { GlassBackButton } from '../components/employeeDetail/GlassBackButton';
import { HomeGlassBackground } from '../components/home/HomeGlassBackground';
import { HOME_BG_DARK, HOME_BG_LIGHT } from '../components/home/homeGlass';
import { NetworkErrorPanel } from '../components/NetworkErrorPanel';
import { RecordsSearchField } from '../components/records/RecordsSearchField';
import { ViewOnlyBanner } from '../components/ViewOnlyBanner';
import { useCanManageAttendance } from '../hooks/useCanManageAttendance';
import type { MoreStackParamList } from '../navigation/types';
import type { DailyAttendanceRow, DailyAttendanceSummary } from '../types/attendance';
import { overviewScrollPaddingBottom } from '../theme/homeTheme';
import { useHomeTheme } from '../theme/HomeThemeProvider';
import { useI18n } from '../i18n/I18nProvider';
import type { AppTypography } from '../i18n/fonts';
import { mirroredRow } from '../ui/rtlLayout';

type Props = NativeStackScreenProps<MoreStackParamList, 'Daily'>;

export function DailyAttendanceScreen({ route, navigation }: Props) {
  const attentionOnly = route.params?.attentionOnly === true;
  const { t } = useTranslation('attendance');
  const { mirrorLayout, typography } = useI18n();
  const canManage = useCanManageAttendance();
  const insets = useSafeAreaInsets();
  const { palette, isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );
  const scrollBottomPad = overviewScrollPaddingBottom(insets.bottom);

  const [date, setDate] = useState(todayDateKey());
  const [rows, setRows] = useState<DailyAttendanceRow[]>([]);
  const [summary, setSummary] = useState<DailyAttendanceSummary | null>(null);
  const [nameLookup, setNameLookup] = useState<Map<string, string>>(new Map());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DailyStatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [dataReady, setDataReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [errorIsNetwork, setErrorIsNetwork] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        RNStatusBar.setTranslucent(true);
        RNStatusBar.setBackgroundColor('transparent');
      }
      setStatusBarStyle(isDark ? 'light' : 'dark');
    }, [isDark]),
  );

  const load = useCallback(async () => {
    setError('');
    setErrorIsNetwork(false);
    try {
      const [report, users] = await Promise.all([
        getDailyReport(date),
        listAttendanceUsers(),
      ]);
      setRows(report.rows);
      setSummary(report.summary);
      setNameLookup(buildNameLookup(mergeEmployeesWithPunchIds(users, [])));
      setDataReady(true);
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'daily.loadError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
      setDataReady(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [date, t]);

  useEffect(() => {
    setDataReady(false);
    setSummary(null);
    setRows([]);
    setLoading(true);
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = attentionOnly ? filterDailyAttentionRows(rows) : rows;
    if (statusFilter !== 'all') {
      list = list.filter((row) => matchesDailyStatusFilter(row, statusFilter));
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((row) => {
      const name = nameLookup.get(row.deviceUserId) || row.deviceUserId;
      return (
        row.deviceUserId.toLowerCase().includes(q) ||
        name.toLowerCase().includes(q)
      );
    });
  }, [rows, search, nameLookup, attentionOnly, statusFilter]);

  const showOffDayBanner = isNonWorkingSchoolDay(date, summary);
  const showSkeleton = loading || !dataReady;

  async function handlePdf() {
    setExporting(true);
    setError('');
    setErrorIsNetwork(false);
    try {
      await shareAttendanceReportPdf({
        type: 'daily',
        fromDate: date,
        toDate: date,
      });
    } catch (err) {
      const resolved = resolveUserFacingError(err, t, 'daily.pdfError');
      if (resolved.sessionExpired) return;
      setError(resolved.message);
      setErrorIsNetwork(resolved.isNetwork);
    } finally {
      setExporting(false);
    }
  }

  const listHeader = (
    <View style={styles.headerBlock}>
      {!canManage ? (
        <View style={styles.bannerWrap}>
          <ViewOnlyBanner />
        </View>
      ) : null}

      <View style={[styles.topRow, mirroredRow(mirrorLayout)]}>
        <GlassBackButton onPress={() => navigation.goBack()} />
        <Text style={styles.screenTitle} numberOfLines={1}>
          {t('tabs.daily')}
        </Text>
        <GlassCircleIconButton
          icon="download-outline"
          onPress={() => void handlePdf()}
          loading={exporting}
          disabled={exporting}
          accessibilityLabel={t('daily.exportPdf')}
        />
      </View>

      <DailyWeekStrip value={date} onChange={setDate} />

      {errorIsNetwork ? (
        <NetworkErrorPanel message={error} onRetry={() => void load()} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      {showSkeleton ? (
        <DailySkeleton />
      ) : summary ? (
        <>
          <DailySummaryCard summary={summary} showOffDayBanner={showOffDayBanner} />
          <DailyFilterChips value={statusFilter} onChange={setStatusFilter} />
          <RecordsSearchField
            value={search}
            onChangeText={setSearch}
            placeholder={t('daily.searchPlaceholder')}
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
          data={[]}
          keyExtractor={() => 'daily'}
          style={styles.list}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: scrollBottomPad },
            !showSkeleton && filtered.length === 0 && styles.listEmptyGrow,
          ]}
          ListHeaderComponent={
            <View style={{ paddingTop: insets.top > 0 ? 0 : 8 }}>{listHeader}</View>
          }
          ListEmptyComponent={showSkeleton ? null : <DailyEmptyState />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                setDataReady(false);
                void load();
              }}
              tintColor={palette.teal}
            />
          }
          renderItem={() => null}
          ListFooterComponent={
            !showSkeleton && filtered.length > 0 ? (
              <DailyListCard
                rows={filtered}
                nameLookup={nameLookup}
                onPressRow={(deviceUserId, name) =>
                  navigation.navigate('EmployeeDetail', { deviceUserId, name })
                }
              />
            ) : null
          }
        />
      </SafeAreaView>
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
  });
}
