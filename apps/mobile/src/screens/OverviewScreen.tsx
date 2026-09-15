import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ApiClientError } from '../api/client';
import {
  getEmployeeReport,
  listAttendanceRecords,
  listAttendanceUsers,
} from '../api/attendance';
import { copy } from '../copy/attendance';
import { todayDateKey } from '../attendance/formatters';
import { useAuth } from '../auth/context';

/**
 * Web overview counts `mergeEmployeesWithPunchIds(users, today's records)`,
 * so punch-only device IDs (punched today, no AttendanceUser row) inflate
 * the employee total. Mobile uses `users.length` only — registered device
 * users. Present/late can still include punch-only IDs from today's records.
 */
export function OverviewScreen() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [employeeCount, setEmployeeCount] = useState(0);
  const [todayPresent, setTodayPresent] = useState(0);
  const [lateToday, setLateToday] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState('0');

  const load = useCallback(async () => {
    setError('');
    const today = todayDateKey();
    try {
      const [users, records, report] = await Promise.all([
        listAttendanceUsers(),
        listAttendanceRecords({ fromDate: today, toDate: today, limit: 500 }),
        getEmployeeReport({ fromDate: today, toDate: today }),
      ]);
      setEmployeeCount(users.length);

      const presentIds = new Set<string>();
      for (const record of records) {
        if (
          record.punchType === 'entry_on_time' ||
          record.punchType === 'entry_late' ||
          record.punchType === 'exit' ||
          record.punchType === 'early_exit'
        ) {
          presentIds.add(record.deviceUserId);
        }
      }
      setTodayPresent(presentIds.size);
      setLateToday(records.filter((r) => r.punchType === 'entry_late').length);

      const totalExpected = report.rows.reduce(
        (sum, row) => sum + row.expectedWorkingDays,
        0,
      );
      const totalPresent = report.rows.reduce(
        (sum, row) => sum + row.workingDaysPresent,
        0,
      );
      setAttendanceRate(
        totalExpected > 0
          ? ((totalPresent / totalExpected) * 100).toFixed(1)
          : '0',
      );
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : copy.overview.loadError,
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f766e" />
        <Text style={styles.muted}>{copy.loading}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
    <ScrollView
      contentContainerStyle={styles.content}
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
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>{copy.tabs.overview}</Text>
        <Pressable onPress={() => void logout()}>
          <Text style={styles.logout}>{copy.logout}</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Metric
        label={copy.overview.employees}
        value={String(employeeCount)}
        footer={copy.overview.employeesFooter}
      />
      <Metric
        label={copy.overview.todayPresent}
        value={String(todayPresent)}
        footer={copy.overview.todayPresentFooter(employeeCount)}
      />
      <Metric label={copy.overview.todayLate} value={String(lateToday)} />
      <Metric
        label={copy.overview.attendanceRate}
        value={`${attendanceRate}%`}
        footer={copy.overview.attendanceRateFooter}
      />
    </ScrollView>
    </SafeAreaView>
  );
}

function Metric({
  label,
  value,
  footer,
}: {
  label: string;
  value: string;
  footer?: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      {footer ? <Text style={styles.cardFooter}>{footer}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    gap: 8,
  },
  content: { padding: 16, paddingBottom: 32, backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 22, fontWeight: '600', color: '#0f172a' },
  logout: { fontSize: 15, fontWeight: '600', color: '#0f766e' },
  muted: { color: '#64748b' },
  error: { color: '#b91c1c', marginBottom: 12 },
  card: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  cardLabel: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  cardValue: { fontSize: 28, fontWeight: '700', color: '#0f172a', marginTop: 4 },
  cardFooter: { fontSize: 12, color: '#94a3b8', marginTop: 6 },
});
