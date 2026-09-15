import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ApiClientError } from '../api/client';
import {
  listAttendanceDevices,
  listAttendanceRecords,
} from '../api/attendance';
import { DateRangeChips } from '../components/DateRangeChips';
import { PunchRow } from '../components/PunchRow';
import { copy } from '../copy/attendance';
import { getQuickRange } from '../attendance/formatters';
import { buildDeviceNameLookup } from '../attendance/lookups';
import type { AttendanceRecord, DateFilter } from '../types/attendance';
import type { EmployeeDetailProps } from '../navigation/types';

export function EmployeeDetailScreen({ route }: EmployeeDetailProps) {
  const { deviceUserId, name } = route.params;
  const [filter, setFilter] = useState<DateFilter>(() => {
    const month = getQuickRange('month');
    return { fromDate: month.from, toDate: month.to };
  });
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [deviceNames, setDeviceNames] = useState<Map<string, string>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [rows, devices] = await Promise.all([
        listAttendanceRecords({
          fromDate: filter.fromDate,
          toDate: filter.toDate,
          deviceUserId,
          limit: 5000,
        }),
        listAttendanceDevices(),
      ]);
      setRecords(rows);
      setDeviceNames(buildDeviceNameLookup(devices));
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : copy.records.loadError,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [deviceUserId, filter.fromDate, filter.toDate]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>{deviceUserId}</Text>
      <DateRangeChips filter={filter} onChange={setFilter} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {loading && records.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0f766e" />
          <Text style={styles.muted}>{copy.loading}</Text>
        </View>
      ) : (
        <FlatList
          data={records}
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
            <Text style={styles.empty}>{copy.records.empty}</Text>
          }
          renderItem={({ item }) => (
            <PunchRow
              record={item}
              name={name}
              deviceName={deviceNames.get(item.deviceSerial) || item.deviceSerial}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  subtitle: { fontSize: 13, color: '#64748b', marginBottom: 12 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  muted: { color: '#64748b' },
  error: { color: '#b91c1c', marginBottom: 8 },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 24 },
});
