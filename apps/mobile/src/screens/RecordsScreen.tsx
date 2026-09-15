import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { ApiClientError } from '../api/client';
import {
  listAttendanceDevices,
  listAttendanceRecords,
  listAttendanceUsers,
} from '../api/attendance';
import { DateRangeChips } from '../components/DateRangeChips';
import { PunchRow } from '../components/PunchRow';
import { SearchField } from '../components/SearchField';
import { displayName, todayDateKey } from '../attendance/formatters';
import {
  buildDeviceNameLookup,
  buildNameLookup,
} from '../attendance/lookups';
import type { AttendanceRecord, DateFilter } from '../types/attendance';
import type { RecordsStackParamList } from '../navigation/types';
import { AppText } from '../ui/AppText';

type Props = NativeStackScreenProps<RecordsStackParamList, 'RecordsList'>;

export function RecordsScreen({ navigation }: Props) {
  const { t } = useTranslation();
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
          limit: 500,
        }),
      ]);
      setNameLookup(buildNameLookup(users));
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
      <DateRangeChips filter={filter} onChange={setFilter} />
      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder={t('attendance:records.searchPlaceholder')}
      />
      {error ? <AppText style={styles.error}>{error}</AppText> : null}
      <FlatList
        data={filtered}
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
  error: { color: '#b91c1c', marginBottom: 8 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 24 },
});
