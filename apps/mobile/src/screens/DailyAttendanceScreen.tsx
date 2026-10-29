import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { ApiClientError } from '../api/client';
import {
  getDailyReport,
  listAttendanceUsers,
  shareAttendanceReportPdf,
} from '../api/attendance';
import { DAILY_STATUS_BADGE } from '../attendance/daily-status';
import {
  displayName,
  formatDisplayTime,
  todayDateKey,
} from '../attendance/formatters';
import { buildNameLookup, mergeEmployeesWithPunchIds } from '../attendance/lookups';
import { SearchField } from '../components/SearchField';
import { SingleDatePicker } from '../components/SingleDatePicker';
import { MetricCard } from '../components/MetricCard';
import { ViewOnlyBanner } from '../components/ViewOnlyBanner';
import { useCanManageAttendance } from '../hooks/useCanManageAttendance';
import type { PunchType } from '../types/attendance';
import type { DailyAttendanceRow, DailyAttendanceSummary } from '../types/attendance';
import { AppText } from '../ui/AppText';
import { ltrText } from '../ui/ltr';

export function DailyAttendanceScreen() {
  const { t } = useTranslation('attendance');
  const canManage = useCanManageAttendance();
  const [date, setDate] = useState(todayDateKey());
  const [rows, setRows] = useState<DailyAttendanceRow[]>([]);
  const [summary, setSummary] = useState<DailyAttendanceSummary | null>(null);
  const [nameLookup, setNameLookup] = useState<Map<string, string>>(new Map());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [report, users] = await Promise.all([
        getDailyReport(date),
        listAttendanceUsers(),
      ]);
      setRows(report.rows);
      setSummary(report.summary);
      setNameLookup(buildNameLookup(mergeEmployeesWithPunchIds(users, [])));
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : t('daily.loadError'),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [date, t]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const name = nameLookup.get(row.deviceUserId) || row.deviceUserId;
      return (
        row.deviceUserId.toLowerCase().includes(q) ||
        name.toLowerCase().includes(q)
      );
    });
  }, [rows, search, nameLookup]);

  async function handlePdf() {
    setExporting(true);
    setError('');
    try {
      await shareAttendanceReportPdf({
        type: 'daily',
        fromDate: date,
        toDate: date,
      });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : t('daily.pdfError'));
    } finally {
      setExporting(false);
    }
  }

  function statusLabel(status: DailyAttendanceRow['status']) {
    return t(`daily.status.${status}`);
  }

  function punchLabel(type: PunchType | null | undefined) {
    if (!type) return '–';
    return t(`punchTypes.${type}`);
  }

  return (
    <View style={styles.container}>
      {!canManage ? <ViewOnlyBanner /> : null}
      <SingleDatePicker label={t('daily.pickDate')} value={date} onChange={setDate} />
      <Pressable
        style={[styles.pdfBtn, exporting && styles.pdfBtnDisabled]}
        disabled={exporting}
        onPress={() => void handlePdf()}
      >
        {exporting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <AppText style={styles.pdfBtnText}>{t('daily.exportPdf')}</AppText>
        )}
      </Pressable>

      {error ? <AppText style={styles.error}>{error}</AppText> : null}

      {loading && !summary ? (
        <ActivityIndicator size="large" color="#0f766e" style={styles.loader} />
      ) : summary ? (
        <View style={styles.metrics}>
          <MetricCard label={t('daily.summary.present')} value={summary.present} />
          <MetricCard label={t('daily.summary.late')} value={summary.late} />
          <MetricCard label={t('daily.summary.earlyExit')} value={summary.earlyExit} />
          <MetricCard label={t('daily.summary.absent')} value={summary.absent} />
          <MetricCard label={t('daily.summary.onLeave')} value={summary.onLeave} />
          <MetricCard
            label={t('daily.summary.officialHoliday')}
            value={summary.officialHoliday}
          />
          <MetricCard label={t('daily.summary.dayOff')} value={summary.dayOff} />
        </View>
      ) : null}

      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder={t('daily.searchPlaceholder')}
      />

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
          !loading ? (
            <AppText style={styles.empty}>{t('daily.empty')}</AppText>
          ) : null
        }
        renderItem={({ item }) => {
          const name = displayName(
            nameLookup.get(item.deviceUserId),
            item.deviceUserId,
          );
          const badge = DAILY_STATUS_BADGE[item.status];
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <AppText style={styles.name} numberOfLines={1}>
                  {name}
                </AppText>
                <View style={[styles.badge, { backgroundColor: badge.backgroundColor }]}>
                  <AppText style={[styles.badgeText, { color: badge.color }]}>
                    {statusLabel(item.status)}
                  </AppText>
                </View>
              </View>
              <AppText style={[styles.id, ltrText]}>{item.deviceUserId}</AppText>
              {item.entryTime || item.exitTime || item.entryType || item.exitType ? (
                <>
                  <AppText style={styles.times}>
                    {t('daily.entry')}:{' '}
                    <AppText style={ltrText}>
                      {item.entryTime ? formatDisplayTime(item.entryTime) : '–'}
                    </AppText>
                    {' · '}
                    {t('daily.entryType')}: {punchLabel(item.entryType)}
                  </AppText>
                  <AppText style={styles.times}>
                    {t('daily.exit')}:{' '}
                    <AppText style={ltrText}>
                      {item.exitTime ? formatDisplayTime(item.exitTime) : '–'}
                    </AppText>
                    {' · '}
                    {t('daily.exitType')}: {punchLabel(item.exitType)}
                  </AppText>
                </>
              ) : null}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  pdfBtn: {
    backgroundColor: '#0f766e',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  pdfBtnDisabled: { opacity: 0.7 },
  pdfBtnText: { color: '#fff', fontWeight: '600' },
  error: { color: '#b91c1c', marginBottom: 8 },
  loader: { marginTop: 24 },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  empty: { textAlign: 'center', color: '#64748b', marginTop: 24 },
  card: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  name: { fontSize: 16, fontWeight: '600', flex: 1 },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  id: { fontSize: 12, color: '#64748b', marginTop: 4 },
  times: { fontSize: 13, color: '#334155', marginTop: 8 },
});
