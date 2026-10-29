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
import { setStatusBarStyle } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { resolveUserFacingError } from '../api/client';
import { NetworkErrorPanel } from '../components/NetworkErrorPanel';
import {
  getDailyReport,
  listAttendanceRecords,
  listAttendanceUsers,
} from '../api/attendance';
import { displayName, getQuickRange, todayDateKey } from '../attendance/formatters';
import { mergeEmployeesWithPunchIds } from '../attendance/lookups';
import { ViewOnlyBanner } from '../components/ViewOnlyBanner';
import { GlassBackButton } from '../components/employeeDetail/GlassBackButton';
import { HomeGlassBackground } from '../components/home/HomeGlassBackground';
import { HOME_BG_DARK, HOME_BG_LIGHT } from '../components/home/homeGlass';
import { EmployeesEmptyState } from '../components/employees/EmployeesEmptyState';
import {
  matchesEmployeeFilter,
  type EmployeeStatusFilter,
} from '../components/employees/employeeFilters';
import { EmployeesFilterChips } from '../components/employees/EmployeesFilterChips';
import { EmployeesListCard } from '../components/employees/EmployeesListCard';
import { EmployeesSkeleton } from '../components/employees/EmployeesSkeleton';
import { RecordsSearchField } from '../components/records/RecordsSearchField';
import { useCanManageAttendance } from '../hooks/useCanManageAttendance';
import type { DailyAttendanceRow, MergedAttendanceEmployee } from '../types/attendance';
import type { MoreStackParamList } from '../navigation/types';
import { overviewScrollPaddingBottom } from '../theme/homeTheme';
import { useHomeTheme } from '../theme/HomeThemeProvider';
import { useI18n } from '../i18n/I18nProvider';
import type { AppTypography } from '../i18n/fonts';
import { AppText } from '../ui/AppText';
import { mirroredRow } from '../ui/rtlLayout';

type Props = NativeStackScreenProps<MoreStackParamList, 'EmployeesList'>;

export function EmployeesScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const canManage = useCanManageAttendance();
  const insets = useSafeAreaInsets();
  const { palette, isDark } = useHomeTheme();
  const { mirrorLayout, typography } = useI18n();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );
  const scrollBottomPad = overviewScrollPaddingBottom(insets.bottom);

  const [employees, setEmployees] = useState<MergedAttendanceEmployee[]>([]);
  const [rowsByDeviceId, setRowsByDeviceId] = useState<
    Map<string, DailyAttendanceRow>
  >(new Map());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EmployeeStatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [errorIsNetwork, setErrorIsNetwork] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const range = getQuickRange('month');
      const today = todayDateKey();
      const [users, records, report] = await Promise.all([
        listAttendanceUsers(),
        listAttendanceRecords({
          fromDate: range.from,
          toDate: range.to,
          limit: 500,
        }),
        getDailyReport(today),
      ]);
      setEmployees(mergeEmployeesWithPunchIds(users, records));
      const todayMap = new Map<string, DailyAttendanceRow>();
      for (const row of report.rows) {
        todayMap.set(row.deviceUserId, row);
      }
      setRowsByDeviceId(todayMap);
    } catch (err) {
      const resolved = resolveUserFacingError(
        err,
        t,
        'attendance:employees.loadError',
      );
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
    return employees.filter((user) => {
      if (q) {
        const matchId = user.deviceUserId.toLowerCase().includes(q);
        const matchName = (user.name || '').toLowerCase().includes(q);
        if (!matchId && !matchName) return false;
      }
      return matchesEmployeeFilter(
        user,
        statusFilter,
        rowsByDeviceId.get(user.deviceUserId),
      );
    });
  }, [employees, search, statusFilter, rowsByDeviceId]);

  const listHeader = (
    <View style={[styles.headerBlock, { paddingTop: insets.top }]}>
      {!canManage ? (
        <View style={styles.bannerWrap}>
          <ViewOnlyBanner />
        </View>
      ) : null}

      <View style={[styles.topRow, mirroredRow(mirrorLayout)]}>
        <GlassBackButton onPress={() => navigation.goBack()} />
        <View style={styles.titleRowInner}>
          <Text style={styles.screenTitle}>{t('attendance:tabs.employees')}</Text>
          <Text style={styles.count}>{employees.length}</Text>
        </View>
        <View style={styles.topSpacer} />
      </View>

      <RecordsSearchField
        value={search}
        onChangeText={setSearch}
        placeholder={t('attendance:employees.searchPlaceholder')}
      />

      <EmployeesFilterChips value={statusFilter} onChange={setStatusFilter} />

      {errorIsNetwork ? (
        <NetworkErrorPanel message={error} onRetry={() => void load()} />
      ) : error ? (
        <AppText style={styles.error}>{error}</AppText>
      ) : null}
    </View>
  );

  if (loading && employees.length === 0) {
    return (
      <View style={styles.root}>
        <HomeGlassBackground isDark={isDark} />
        <SafeAreaView style={styles.safe} edges={[]}>
          <View style={[styles.scrollContent, { paddingBottom: scrollBottomPad }]}>
            {listHeader}
            <EmployeesSkeleton />
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
          data={filtered.length > 0 ? [{ key: 'list' }] : []}
          keyExtractor={(item) => item.key}
          style={styles.list}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: scrollBottomPad },
            filtered.length === 0 && styles.listEmptyGrow,
          ]}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={<EmployeesEmptyState />}
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
          renderItem={() => (
            <EmployeesListCard
              employees={filtered}
              rowsByDeviceId={rowsByDeviceId}
              onPressRow={(deviceUserId, name) =>
                navigation.navigate('EmployeeDetail', { deviceUserId, name })
              }
            />
          )}
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
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    topSpacer: { width: 40 },
    titleRowInner: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
      gap: 10,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 10,
      marginTop: -4,
    },
    screenTitle: {
      fontFamily: typography.noto.bold,
      fontSize: 26,
      lineHeight: 34,
      color: text,
    },
    count: {
      fontFamily: typography.inter.bold,
      fontSize: 15,
      lineHeight: 20,
      color: muted,
      fontVariant: ['tabular-nums'],
    },
    error: { color: '#EF4444', marginBottom: 4 },
  });
}
