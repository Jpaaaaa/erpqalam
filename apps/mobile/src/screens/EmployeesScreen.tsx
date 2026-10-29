import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { resolveUserFacingError } from '../api/client';
import { NetworkErrorPanel } from '../components/NetworkErrorPanel';
import {
  listAttendanceRecords,
  listAttendanceUsers,
} from '../api/attendance';
import { displayName, getQuickRange } from '../attendance/formatters';
import {
  mergeEmployeesWithPunchIds,
} from '../attendance/lookups';
import { SearchField } from '../components/SearchField';
import { ViewOnlyBanner } from '../components/ViewOnlyBanner';
import { useCanManageAttendance } from '../hooks/useCanManageAttendance';
import type { MergedAttendanceEmployee } from '../types/attendance';
import type { EmployeesStackParamList } from '../navigation/types';
import { TAB_SCENE_BOTTOM_PAD } from '../theme/homeTheme';
import { AppText } from '../ui/AppText';
import { ltrText } from '../ui/ltr';

type Props = NativeStackScreenProps<EmployeesStackParamList, 'EmployeesList'>;

export function EmployeesScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const canManage = useCanManageAttendance();
  const [employees, setEmployees] = useState<MergedAttendanceEmployee[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [errorIsNetwork, setErrorIsNetwork] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const range = getQuickRange('month');
      const [users, records] = await Promise.all([
        listAttendanceUsers(),
        listAttendanceRecords({
          fromDate: range.from,
          toDate: range.to,
          limit: 500,
        }),
      ]);
      setEmployees(mergeEmployeesWithPunchIds(users, records));
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (user) =>
        user.deviceUserId.toLowerCase().includes(q) ||
        (user.name || '').toLowerCase().includes(q),
    );
  }, [employees, search]);

  if (loading) {
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
      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder={t('attendance:employees.searchPlaceholder')}
      />
      {errorIsNetwork ? (
        <NetworkErrorPanel message={error} onRetry={() => void load()} />
      ) : error ? (
        <AppText style={styles.error}>{error}</AppText>
      ) : null}
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
          <AppText style={styles.empty}>
            {t('attendance:employees.empty')}
          </AppText>
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
              <View style={styles.rowHeader}>
                <AppText style={styles.name} numberOfLines={1}>
                  {name}
                </AppText>
                {item.isUnregistered ? (
                  <AppText style={styles.badge}>
                    {t('attendance:employees.unregistered')}
                  </AppText>
                ) : null}
              </View>
              <AppText style={styles.id} numberOfLines={1}>
                {t('attendance:employees.deviceUserId')}{' '}
                <AppText style={[styles.id, ltrText]}>{item.deviceUserId}</AppText>
              </AppText>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: TAB_SCENE_BOTTOM_PAD,
  },
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
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: { fontSize: 16, fontWeight: '600', color: '#0f172a', flex: 1 },
  badge: {
    fontSize: 11,
    fontWeight: '600',
    color: '#92400e',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  id: { fontSize: 13, color: '#64748b', marginTop: 2 },
});
