import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ApiClientError } from '../api/client';
import { listAttendanceUsers } from '../api/attendance';
import { SearchField } from '../components/SearchField';
import { copy } from '../copy/attendance';
import { displayName } from '../attendance/formatters';
import type { AttendanceUser } from '../types/attendance';
import type { EmployeesStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<EmployeesStackParamList, 'EmployeesList'>;

export function EmployeesScreen({ navigation }: Props) {
  const [users, setUsers] = useState<AttendanceUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      // Registered AttendanceUser rows only. Web also merges punch-only IDs
      // from an undated records fetch (last 500 punches, any time).
      setUsers(await listAttendanceUsers());
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : copy.employees.loadError,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) =>
        user.deviceUserId.toLowerCase().includes(q) ||
        (user.name || '').toLowerCase().includes(q),
    );
  }, [users, search]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.muted}>{copy.loading}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder={copy.employees.searchPlaceholder}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.deviceUserId}
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
          <Text style={styles.empty}>{copy.employees.empty}</Text>
        }
        renderItem={({ item }) => {
          const name = displayName(item.name, item.deviceUserId);
          return (
            <Pressable
              style={styles.row}
              onPress={() =>
                navigation.navigate('EmployeeDetail', {
                  deviceUserId: item.deviceUserId,
                  name,
                })
              }
            >
              <Text style={styles.name}>{name}</Text>
              <Text style={styles.id}>
                {copy.employees.deviceUserId} {item.deviceUserId}
              </Text>
            </Pressable>
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
  row: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  name: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  id: { fontSize: 13, color: '#64748b', marginTop: 2 },
});
