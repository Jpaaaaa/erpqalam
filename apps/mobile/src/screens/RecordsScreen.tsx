import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SectionList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ApiClientError } from '../api/client';
import {
  getDailySummaries,
  listAttendanceDevices,
  listAttendanceRecords,
  listAttendanceUsers,
} from '../api/attendance';
import { timestampToDateKey } from '../attendance/formatters';
import { displayName } from '../attendance/formatters';
import {
  buildDeviceNameLookup,
  buildNameLookup,
  mergeEmployeesWithPunchIds,
} from '../attendance/lookups';
import { DateRangeChips } from '../components/DateRangeChips';
import { PunchRow } from '../components/PunchRow';
import { RecordsDayHeader } from '../components/RecordsDayHeader';
import { SearchField } from '../components/SearchField';
import { ViewOnlyBanner } from '../components/ViewOnlyBanner';
import { useCanManageAttendance } from '../hooks/useCanManageAttendance';
import { todayDateKey } from '../attendance/formatters';
import type {
  AttendanceRecord,
  DailyAttendanceSummary,
  DateFilter,
} from '../types/attendance';
import type { RecordsStackParamList } from '../navigation/types';
import { AppText } from '../ui/AppText';

type Props = NativeStackScreenProps<RecordsStackParamList, 'RecordsList'>;

type Section = { date: string; data: AttendanceRecord[] };

export function RecordsScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const canManage = useCanManageAttendance();
  const today = todayDateKey();
  const [filter, setFilter] = useState<DateFilter>({
    fromDate: today,
    toDate: today,
  });
  const [search, setSearch] = useState('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [nameLookup, setNameLookup] = useState<Map<string, string>>(new Map());
  const [deviceNames, setDeviceNames] = useState<Map<string, string>>(
    new Map(),
  );
  const [daySummaries, setDaySummaries] = useState<
    Map<string, DailyAttendanceSummary>
  >(new Map());
  const [collapsedDates, setCollapsedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

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
      setError(
        err instanceof ApiClientError
          ? err.message
          : t('attendance:records.loadError'),
      );
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

  const sections: Section[] = useMemo(() => {
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
        data: collapsedDates.has(date)
          ? []
          : [...items].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
      }));
  }, [filtered, collapsedDates]);

  function toggleDate(date: string) {
    setCollapsedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  }

  if (loading && records.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f766e" />
        <AppText style={styles.muted}>{t('common:loading')}</AppText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!canManage ? <ViewOnlyBanner /> : null}
      <DateRangeChips filter={filter} onChange={setFilter} />
      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder={t('attendance:records.searchPlaceholder')}
      />
      {canManage ? (
        <Pressable
          style={styles.manualBtn}
          onPress={() => navigation.navigate('ManualPunch')}
        >
          <AppText style={styles.manualBtnText}>
            {t('attendance:records.addManual')}
          </AppText>
        </Pressable>
      ) : null}
      {error ? <AppText style={styles.error}>{error}</AppText> : null}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
            tintColor="#0f766e"
          />
        }
        ListEmptyComponent={
          <AppText style={styles.empty}>{t('attendance:records.empty')}</AppText>
        }
        renderSectionHeader={({ section }) => (
          <RecordsDayHeader
            date={section.date}
            summary={daySummaries.get(section.date)}
            expanded={!collapsedDates.has(section.date)}
            onToggle={() => toggleDate(section.date)}
          />
        )}
        renderItem={({ item }) => {
          const name = displayName(
            nameLookup.get(item.deviceUserId),
            item.deviceUserId,
          );
          return (
            <PunchRow
              record={item}
              name={name}
              deviceName={deviceNames.get(item.deviceSerial) || item.deviceSerial}
              onPress={() =>
                navigation.navigate('EmployeeDetail', {
                  deviceUserId: item.deviceUserId,
                  name,
                })
              }
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    gap: 8,
  },
  muted: { color: '#64748b' },
  manualBtn: {
    backgroundColor: '#0f766e',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  manualBtnText: { color: '#fff', fontWeight: '600' },
  error: { color: '#b91c1c', marginBottom: 8 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 24 },
});
