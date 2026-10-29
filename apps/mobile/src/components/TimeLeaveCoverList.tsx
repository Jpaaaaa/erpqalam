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
import {
  findLateCoverTimestamp,
  isEarlyExitCovered,
  isLateArrivalCovered,
  lateArrivalCoverId,
} from '../attendance/time-leave-cover';
import { formatDisplayDate } from '../attendance/formatters';
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

export function TimeLeaveCoverList({
  deviceUserId,
  employeeName,
  lateOccurrences,
  earlyExitOccurrences,
  records,
  settings,
  timeLeaveUsage,
  leaveBalances,
  employeeHolidays,
  canManage,
  onCover,
  onRemove,
}: {
  deviceUserId: string;
  employeeName: string;
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

  const usageForEmployee = useMemo(
    () => timeLeaveUsage.filter((u) => u.deviceUserId === deviceUserId),
    [timeLeaveUsage, deviceUserId],
  );

  function statsLine() {
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

  const { tempCount, fullUsed, remaining, allowance } = statsLine();
  const canCover =
    canManage &&
    canCoverWithTimeLeave(
      deviceUserId,
      ctx,
      leaveBalances,
      timeLeaveUsage,
      employeeHolidays,
    );

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
      <AppText style={styles.heading}>{employeeName}</AppText>
      <AppText style={[styles.stats, ltrText]}>
        {t('holidays.tempCount', { count: tempCount })} ·{' '}
        {t('holidays.fullUsed', { used: fullUsed, total: allowance })} ·{' '}
        {t('holidays.remaining', { count: remaining })}
      </AppText>

      <AppText style={styles.section}>{t('holidays.uncoveredLate')}</AppText>
      {lateOccurrences.length === 0 ? (
        <AppText style={styles.muted}>{t('holidays.noUncoveredLate')}</AppText>
      ) : (
        lateOccurrences.map((o) => {
          const key = `late-${o.date}`;
          const ts = findLateCoverTimestamp(
            records,
            deviceUserId,
            o.date,
            settings,
          );
          const covered = isLateArrivalCovered(ts, timeLeaveUsage);
          const coverId = lateArrivalCoverId(ts, timeLeaveUsage);
          return (
            <View key={key} style={styles.item}>
              <AppText style={styles.itemDate}>{formatDisplayDate(o.date)}</AppText>
              {canManage && !covered ? (
                <Pressable
                  disabled={!canCover || busyKey === key}
                  style={[styles.btn, (!canCover || busyKey === key) && styles.btnDisabled]}
                  onPress={() =>
                    void handleCover(key, {
                      deviceUserId,
                      date: o.date,
                      timestamp: ts,
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
              {canManage && covered && coverId ? (
                <Pressable
                  disabled={busyKey === coverId}
                  style={[styles.btnDanger, busyKey === coverId && styles.btnDisabled]}
                  onPress={() => {
                    setBusyKey(coverId);
                    void onRemove(coverId).finally(() => setBusyKey(null));
                  }}
                >
                  {busyKey === coverId ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <AppText style={styles.btnText}>{t('holidays.removeTimeLeave')}</AppText>
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
          const key = `early-${o.date}`;
          const covered = isEarlyExitCovered(deviceUserId, o.date, timeLeaveUsage);
          const coverRow = usageForEmployee.find(
            (u) => u.type === 'early_exit' && u.date === o.date,
          );
          return (
            <View key={key} style={styles.item}>
              <AppText style={styles.itemDate}>{formatDisplayDate(o.date)}</AppText>
              {canManage && !covered ? (
                <Pressable
                  disabled={!canCover || busyKey === key}
                  style={[styles.btn, (!canCover || busyKey === key) && styles.btnDisabled]}
                  onPress={() =>
                    void handleCover(key, {
                      deviceUserId,
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
              {canManage && covered && coverRow ? (
                <Pressable
                  disabled={busyKey === coverRow.id}
                  style={[styles.btnDanger, busyKey === coverRow.id && styles.btnDisabled]}
                  onPress={() => {
                    setBusyKey(coverRow.id);
                    void onRemove(coverRow.id).finally(() => setBusyKey(null));
                  }}
                >
                  {busyKey === coverRow.id ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <AppText style={styles.btnText}>{t('holidays.removeTimeLeave')}</AppText>
                  )}
                </Pressable>
              ) : null}
            </View>
          );
        })
      )}

      {usageForEmployee.length > 0 ? (
        <>
          <AppText style={styles.section}>{t('holidays.timeLeave')}</AppText>
          {usageForEmployee.map((u) => (
            <View key={u.id} style={styles.usageRow}>
              <AppText style={styles.usageText}>
                {formatDisplayDate(u.date)} —{' '}
                {t(`holidays.timeLeaveTypes.${u.type}` as 'holidays.timeLeaveTypes.late_arrival')}
              </AppText>
              {canManage ? (
                <Pressable
                  disabled={busyKey === u.id}
                  onPress={() => {
                    setBusyKey(u.id);
                    void onRemove(u.id).finally(() => setBusyKey(null));
                  }}
                >
                  <AppText style={styles.removeLink}>{t('holidays.removeTimeLeave')}</AppText>
                </Pressable>
              ) : null}
            </View>
          ))}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  heading: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  stats: { fontSize: 12, color: '#64748b', marginBottom: 12 },
  section: { fontSize: 14, fontWeight: '600', marginTop: 8, marginBottom: 6 },
  muted: { fontSize: 13, color: '#94a3b8', marginBottom: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 8,
  },
  itemDate: { fontSize: 14, flex: 1 },
  btn: {
    backgroundColor: '#0f766e',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  btnDanger: {
    backgroundColor: '#b91c1c',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  usageText: { fontSize: 13, flex: 1 },
  removeLink: { color: '#b91c1c', fontWeight: '600', fontSize: 13 },
});
