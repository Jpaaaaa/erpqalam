import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  canCoverWithTimeLeave,
  countEmployeeHolidaysForUser,
  countTimeLeaveForUser,
  fullHolidaysFromTempLeave,
  getBalanceDays,
  remainingLeaveDays,
} from '../attendance/leave-balance';
import { findLateCoverTimestamp } from '../attendance/time-leave-cover';
import { displayName, formatDisplayDate } from '../attendance/formatters';
import type {
  AttendanceRecord,
  AttendanceSettings,
  EmployeeHoliday,
  LeaveBalance,
  TimeLeaveType,
  TimeLeaveUsage,
} from '../types/attendance';
import { AppText } from '../ui/AppText';
import { ltrText } from '../ui/ltr';

export function TimeLeaveCoverAllSection({
  lateOccurrences,
  earlyExitOccurrences,
  records,
  settings,
  timeLeaveUsage,
  leaveBalances,
  employeeHolidays,
  nameLookup,
  canManage,
  onCover,
  onRemove,
}: {
  lateOccurrences: { deviceUserId: string; date: string }[];
  earlyExitOccurrences: {
    deviceUserId: string;
    date: string;
    timestamp: string;
  }[];
  records: AttendanceRecord[];
  settings: AttendanceSettings;
  timeLeaveUsage: TimeLeaveUsage[];
  leaveBalances: LeaveBalance[];
  employeeHolidays: EmployeeHoliday[];
  nameLookup: Map<string, string>;
  canManage: boolean;
  onCover: (payload: {
    deviceUserId: string;
    date: string;
    timestamp: string;
    type: TimeLeaveType;
  }) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const { t } = useTranslation('attendance');
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const ctx = useMemo(
    () => ({
      tempHolidaysPerFullHoliday: settings.tempHolidaysPerFullHoliday,
      annualHolidaysDays: settings.annualHolidaysDays,
    }),
    [settings],
  );

  function statsLine(deviceUserId: string) {
    const tempCount = countTimeLeaveForUser(deviceUserId, timeLeaveUsage);
    const fullUsed = fullHolidaysFromTempLeave(
      tempCount,
      ctx.tempHolidaysPerFullHoliday,
    );
    const empCount = countEmployeeHolidaysForUser(deviceUserId, employeeHolidays);
    const remaining = remainingLeaveDays(
      deviceUserId,
      ctx,
      leaveBalances,
      timeLeaveUsage,
      employeeHolidays,
    );
    const balanceDays = getBalanceDays(deviceUserId, leaveBalances);
    const allowance =
      balanceDays > 0
        ? balanceDays + empCount
        : settings.annualHolidaysDays;
    return { tempCount, fullUsed, remaining, allowance: Math.max(1, allowance) };
  }

  async function handleCover(
    key: string,
    payload: {
      deviceUserId: string;
      date: string;
      timestamp: string;
      type: TimeLeaveType;
    },
  ) {
    setBusyKey(key);
    try {
      await onCover(payload);
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <View style={styles.wrap}>
      <AppText style={styles.section}>{t('holidays.uncoveredLate')}</AppText>
      {lateOccurrences.length === 0 ? (
        <AppText style={styles.muted}>{t('holidays.noUncoveredLate')}</AppText>
      ) : (
        lateOccurrences.map((o) => {
          const key = `late-${o.deviceUserId}-${o.date}`;
          const name = displayName(nameLookup.get(o.deviceUserId), o.deviceUserId);
          const { tempCount, fullUsed, remaining, allowance } = statsLine(o.deviceUserId);
          const canCover =
            canManage &&
            canCoverWithTimeLeave(
              o.deviceUserId,
              ctx,
              leaveBalances,
              timeLeaveUsage,
              employeeHolidays,
            );
          return (
            <View key={key} style={styles.item}>
              <View style={styles.itemBody}>
                <AppText style={styles.name} numberOfLines={1}>
                  {name}
                </AppText>
                <AppText style={[styles.meta, ltrText]}>
                  {formatDisplayDate(o.date)}
                </AppText>
                <AppText style={styles.stats} numberOfLines={2}>
                  {t('holidays.tempCount', { count: tempCount })} ·{' '}
                  {t('holidays.fullUsed', { used: fullUsed, total: allowance })} ·{' '}
                  {t('holidays.remaining', { count: remaining })}
                </AppText>
              </View>
              {canManage ? (
                <Pressable
                  disabled={!canCover || busyKey === key}
                  style={[styles.btn, (!canCover || busyKey === key) && styles.btnDisabled]}
                  onPress={() =>
                    void handleCover(key, {
                      deviceUserId: o.deviceUserId,
                      date: o.date,
                      timestamp: findLateCoverTimestamp(
                        records,
                        o.deviceUserId,
                        o.date,
                        settings,
                      ),
                      type: 'late_arrival',
                    })
                  }
                >
                  {busyKey === key ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <AppText style={styles.btnText}>{t('holidays.coverTimeLeave')}</AppText>
                  )}
                </Pressable>
              ) : null}
            </View>
          );
        })
      )}

      <AppText style={styles.section}>{t('holidays.uncoveredEarly')}</AppText>
      {earlyExitOccurrences.length === 0 ? (
        <AppText style={styles.muted}>{t('holidays.noUncoveredEarly')}</AppText>
      ) : (
        earlyExitOccurrences.map((o) => {
          const key = `early-${o.deviceUserId}-${o.date}`;
          const name = displayName(nameLookup.get(o.deviceUserId), o.deviceUserId);
          const { tempCount, fullUsed, remaining, allowance } = statsLine(o.deviceUserId);
          const canCover =
            canManage &&
            canCoverWithTimeLeave(
              o.deviceUserId,
              ctx,
              leaveBalances,
              timeLeaveUsage,
              employeeHolidays,
            );
          return (
            <View key={key} style={styles.item}>
              <View style={styles.itemBody}>
                <AppText style={styles.name} numberOfLines={1}>
                  {name}
                </AppText>
                <AppText style={[styles.meta, ltrText]}>
                  {formatDisplayDate(o.date)}
                </AppText>
                <AppText style={styles.stats} numberOfLines={2}>
                  {t('holidays.tempCount', { count: tempCount })} ·{' '}
                  {t('holidays.fullUsed', { used: fullUsed, total: allowance })} ·{' '}
                  {t('holidays.remaining', { count: remaining })}
                </AppText>
              </View>
              {canManage ? (
                <Pressable
                  disabled={!canCover || busyKey === key}
                  style={[styles.btn, (!canCover || busyKey === key) && styles.btnDisabled]}
                  onPress={() =>
                    void handleCover(key, {
                      deviceUserId: o.deviceUserId,
                      date: o.date,
                      timestamp: o.timestamp,
                      type: 'early_exit',
                    })
                  }
                >
                  {busyKey === key ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <AppText style={styles.btnText}>{t('holidays.coverTimeLeave')}</AppText>
                  )}
                </Pressable>
              ) : null}
            </View>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  section: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 8 },
  muted: { fontSize: 13, color: '#94a3b8', marginBottom: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  itemBody: { flex: 1, minWidth: 0 },
  name: { fontSize: 14, fontWeight: '600' },
  meta: { fontSize: 12, color: '#64748b', marginTop: 2 },
  stats: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  btn: {
    backgroundColor: '#0f766e',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 88,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
});
