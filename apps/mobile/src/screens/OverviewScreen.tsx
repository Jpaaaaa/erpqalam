import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ApiClientError } from '../api/client';
import {
  getEmployeeReport,
  listAttendanceRecords,
  listAttendanceUsers,
} from '../api/attendance';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { todayDateKey } from '../attendance/formatters';
import { useAuth } from '../auth/context';
import { useI18n } from '../i18n/I18nProvider';
import { AppText } from '../ui/AppText';
import { mirroredRow } from '../ui/rtlLayout';

/**
 * Web overview counts `mergeEmployeesWithPunchIds(users, today's records)`,
 * so punch-only device IDs (punched today, no AttendanceUser row) inflate
 * the employee total. Mobile uses `users.length` only — registered device
 * users. Present/late can still include punch-only IDs from today's records.
 */
export function OverviewScreen() {
  const { logout } = useAuth();
  const { mirrorLayout } = useI18n();
  const { t } = useTranslation();
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
        err instanceof ApiClientError
          ? err.message
          : t('attendance:overview.loadError'),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0f766e" />
        <AppText style={styles.muted}>{t('common:loading')}</AppText>
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
        <View style={[styles.headerRow, mirroredRow(mirrorLayout)]}>
          <AppText style={styles.title}>{t('attendance:tabs.overview')}</AppText>
          <Pressable onPress={() => void logout()}>
            <AppText style={styles.logout}>{t('auth:signOut')}</AppText>
          </Pressable>
        </View>

        <View style={styles.switcher}>
          <LanguageSwitcher />
        </View>

        {error ? <AppText style={styles.error}>{error}</AppText> : null}

        <Metric
          label={t('attendance:overview.employees')}
          value={String(employeeCount)}
          footer={t('attendance:overview.employeesFooter')}
        />
        <Metric
          label={t('attendance:overview.todayPresent')}
          value={String(todayPresent)}
          footer={t('attendance:overview.todayPresentFooter', {
            total: employeeCount,
          })}
        />
        <Metric
          label={t('attendance:overview.todayLate')}
          value={String(lateToday)}
        />
        <Metric
          label={t('attendance:overview.attendanceRate')}
          value={`${attendanceRate}%`}
          footer={t('attendance:overview.attendanceRateFooter')}
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
      <AppText style={styles.cardLabel}>{label}</AppText>
      <AppText style={styles.cardValue}>{value}</AppText>
      {footer ? <AppText style={styles.cardFooter}>{footer}</AppText> : null}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switcher: { marginBottom: 16 },
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
