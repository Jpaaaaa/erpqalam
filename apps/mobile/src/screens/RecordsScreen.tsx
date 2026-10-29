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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  navigateToEmployeeDetail,
  navigateToMoreMenu,
  navigateToMoreStackScreen,
} from '../navigation/nestedTabNavigation';
import { setStatusBarStyle } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { resolveUserFacingError } from '../api/client';
import { NetworkErrorPanel } from '../components/NetworkErrorPanel';
import {
  getDailySummaries,
  listAttendanceDevices,
  listAttendanceRecords,
  listAttendanceUsers,
} from '../api/attendance';
import { timestampToDateKey } from '../attendance/formatters';
import {
  buildDeviceNameLookup,
  buildNameLookup,
  mergeEmployeesWithPunchIds,
} from '../attendance/lookups';
import { ViewOnlyBanner } from '../components/ViewOnlyBanner';
import { HomeHeader } from '../components/home/HomeHeader';
import { HomeGlassBackground } from '../components/home/HomeGlassBackground';
import { HOME_BG_DARK, HOME_BG_LIGHT } from '../components/home/homeGlass';
import { RecordsDateChips } from '../components/records/RecordsDateChips';
import { RecordsDayCard } from '../components/records/RecordsDayCard';
import { RecordsEmptyState } from '../components/records/RecordsEmptyState';
import { RecordsFab } from '../components/records/RecordsFab';
import { RecordsSearchField } from '../components/records/RecordsSearchField';
import { RecordsSkeleton } from '../components/records/RecordsSkeleton';
import { useCanManageAttendance } from '../hooks/useCanManageAttendance';
import { todayDateKey } from '../attendance/formatters';
import type {
  AttendanceRecord,
  DailyAttendanceSummary,
  DateFilter,
} from '../types/attendance';
import type { MainTabParamList, RecordsStackParamList } from '../navigation/types';
import { overviewScrollPaddingBottom } from '../theme/homeTheme';
import { useHomeTheme } from '../theme/HomeThemeProvider';
import { useAuth } from '../auth/context';
import { useI18n } from '../i18n/I18nProvider';
import type { AppTypography } from '../i18n/fonts';
import { AppText } from '../ui/AppText';

type Props = NativeStackScreenProps<RecordsStackParamList, 'RecordsList'>;

type DaySection = { date: string; records: AttendanceRecord[] };

export function RecordsScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const canManage = useCanManageAttendance();
  const insets = useSafeAreaInsets();
  const { palette, isDark } = useHomeTheme();
  const { typography } = useI18n();
  const tabNavigation =
    navigation.getParent()?.getParent<BottomTabNavigationProp<MainTabParamList>>() ??
    navigation.getParent<BottomTabNavigationProp<MainTabParamList>>();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );
  const scrollBottomPad = overviewScrollPaddingBottom(insets.bottom) + (canManage ? 72 : 0);

  const today = todayDateKey();
  const [filter, setFilter] = useState<DateFilter>({
    fromDate: today,
    toDate: today,
  });
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [nameLookup, setNameLookup] = useState<Map<string, string>>(new Map());
  const [, setDeviceNames] = useState<Map<string, string>>(new Map());
  const [daySummaries, setDaySummaries] = useState<
    Map<string, DailyAttendanceSummary>
  >(new Map());
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [errorIsNetwork, setErrorIsNetwork] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const [users, devices, rows] = await Promise.all([
        listAttendanceUsers(),
        listAttendanceDevices(),
        listAttendanceRecords({
          fromDate: filter.fromDate,
          toDate: filter.toDate,
          limit: 5000,
        }),
      ]);
      const merged = mergeEmployeesWithPunchIds(users, rows);
      setNameLookup(buildNameLookup(merged));
      setDeviceNames(buildDeviceNameLookup(devices));
      setRecords(rows);
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
  }, [filter.fromDate, filter.toDate, t]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const fromDate = filter.fromDate?.trim();
    const toDate = filter.toDate?.trim();
    if (!fromDate || !toDate) {
      setDaySummaries(new Map());
      return;
    }
    let cancelled = false;
    getDailySummaries({ fromDate, toDate })
      .then((response) => {
        if (cancelled) return;
        const next = new Map<string, DailyAttendanceSummary>();
        for (const item of response.summaries) {
          next.set(item.date, item.summary);
        }
        setDaySummaries(next);
      })
      .catch(() => {
        if (!cancelled) setDaySummaries(new Map());
      });
    return () => {
      cancelled = true;
    };
  }, [filter.fromDate, filter.toDate]);

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter((record) => {
      const name = nameLookup.get(record.deviceUserId) || record.deviceUserId;
      return (
        record.deviceUserId.toLowerCase().includes(q) ||
        name.toLowerCase().includes(q)
      );
    });
  }, [records, search, nameLookup]);

  const daySections: DaySection[] = useMemo(() => {
    const map = new Map<string, AttendanceRecord[]>();
    for (const record of filtered) {
      const key = timestampToDateKey(record.timestamp);
      const list = map.get(key) ?? [];
      list.push(record);
      map.set(key, list);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, items]) => ({
        date,
        records: [...items].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
      }));
  }, [filtered]);

  function toggleDate(date: string) {
    setCollapsedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  }

  function openMoreDaily() {
    if (tabNavigation) {
      navigateToMoreStackScreen(tabNavigation, 'Daily', { attentionOnly: true });
    }
  }

  const listHeader = (
    <View style={[styles.headerBlock, { paddingTop: insets.top }]}>
      {!canManage ? (
        <View style={styles.bannerWrap}>
          <ViewOnlyBanner />
        </View>
      ) : null}

      <HomeHeader
        user={user}
        alertCount={0}
        onAvatarPress={() => {
          if (tabNavigation) navigateToMoreMenu(tabNavigation);
        }}
        onBellPress={openMoreDaily}
      />

      <Text style={styles.screenTitle}>{t('attendance:tabs.records')}</Text>

      <RecordsSearchField
        value={search}
        onChangeText={setSearch}
        placeholder={t('attendance:records.searchPlaceholder')}
      />

      <RecordsDateChips filter={filter} onChange={setFilter} />

      {errorIsNetwork ? (
        <NetworkErrorPanel message={error} onRetry={() => void load()} />
      ) : error ? (
        <AppText style={styles.error}>{error}</AppText>
      ) : null}
    </View>
  );

  if (loading && records.length === 0) {
    return (
      <View style={styles.root}>
        <HomeGlassBackground isDark={isDark} />
        <SafeAreaView style={styles.safe} edges={[]}>
          <View style={[styles.scrollContent, { paddingBottom: scrollBottomPad }]}>
            {listHeader}
            <RecordsSkeleton />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <HomeGlassBackground isDark={isDark} />
      <SafeAreaView style={styles.safe} edges={[]}>
        <FlatList
          data={daySections}
          keyExtractor={(item) => item.date}
          style={styles.list}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: scrollBottomPad },
            daySections.length === 0 && styles.listEmptyGrow,
          ]}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={<RecordsEmptyState />}
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
          renderItem={({ item }) => (
            <RecordsDayCard
              date={item.date}
              records={item.records}
              summary={daySummaries.get(item.date)}
              expanded={!collapsedDates.has(item.date)}
              nameLookup={nameLookup}
              onToggle={() => toggleDate(item.date)}
              onRowPress={(deviceUserId, name) => {
                if (tabNavigation) {
                  navigateToEmployeeDetail(tabNavigation, { deviceUserId, name });
                }
              }}
            />
          )}
        />
        {canManage ? (
          <RecordsFab onPress={() => navigation.navigate('ManualPunch')} />
        ) : null}
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
    safe: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    list: { flex: 1, backgroundColor: 'transparent' },
    scrollContent: {
      paddingHorizontal: 16,
      gap: 16,
    },
    listEmptyGrow: { flexGrow: 1 },
    headerBlock: { gap: 16, marginBottom: 4 },
    bannerWrap: { marginBottom: -8 },
    screenTitle: {
      fontFamily: typography.noto.bold,
      fontSize: 26,
      lineHeight: 34,
      color: text,
      marginTop: -4,
    },
    error: { color: '#EF4444', marginBottom: 4 },
  });
}
