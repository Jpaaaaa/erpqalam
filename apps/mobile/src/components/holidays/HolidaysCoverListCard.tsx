import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  canCoverWithTimeLeave,
} from '../../attendance/leave-balance';
import { findLateCoverTimestamp } from '../../attendance/time-leave-cover';
import { displayName, formatTime24 } from '../../attendance/formatters';
import type {
  AttendanceRecord,
  AttendanceSettings,
  EmployeeHoliday,
  LeaveBalance,
  TimeLeaveType,
  TimeLeaveUsage,
} from '../../types/attendance';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { HomeGlassCard } from '../home/HomeGlassCard';
import { ltrText } from '../../ui/ltr';
import { mirroredRow } from '../../ui/rtlLayout';

function isLatinInitial(ch: string): boolean {
  return /^[A-Za-z0-9]$/.test(ch);
}

type Occurrence = {
  key: string;
  deviceUserId: string;
  date: string;
  timestamp: string;
  type: TimeLeaveType;
  kind: 'late' | 'early';
};

export function HolidaysCoverListCard({
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
}) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout, typography } = useI18n();
  const { isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const ctx = useMemo(
    () => ({
      tempHolidaysPerFullHoliday: settings.tempHolidaysPerFullHoliday,
      annualHolidaysDays: settings.annualHolidaysDays,
    }),
    [settings],
  );

  const items: Occurrence[] = useMemo(() => {
    const late: Occurrence[] = lateOccurrences.map((o) => ({
      key: `late-${o.deviceUserId}-${o.date}`,
      deviceUserId: o.deviceUserId,
      date: o.date,
      timestamp: findLateCoverTimestamp(records, o.deviceUserId, o.date, settings),
      type: 'late_arrival' as const,
      kind: 'late' as const,
    }));
    const early: Occurrence[] = earlyExitOccurrences.map((o) => ({
      key: `early-${o.deviceUserId}-${o.date}`,
      deviceUserId: o.deviceUserId,
      date: o.date,
      timestamp: o.timestamp,
      type: 'early_exit' as const,
      kind: 'early' as const,
    }));
    return [...late, ...early];
  }, [lateOccurrences, earlyExitOccurrences, records, settings]);

  if (items.length === 0) {
    return null;
  }

  return (
    <HomeGlassCard padding={0}>
      {items.map((item, index) => {
        const name = displayName(nameLookup.get(item.deviceUserId), item.deviceUserId);
        const initial = (name.charAt(0) || '?').toUpperCase();
        const initialFont = isLatinInitial(initial)
          ? typography.inter.bold
          : typography.noto.bold;
        const canCover =
          canManage &&
          canCoverWithTimeLeave(
            item.deviceUserId,
            ctx,
            leaveBalances,
            timeLeaveUsage,
            employeeHolidays,
          );
        const label =
          item.kind === 'late'
            ? t('holidays.timeLeaveTypes.late_arrival')
            : t('holidays.timeLeaveTypes.early_exit');

        return (
          <View
            key={item.key}
            style={[
              styles.row,
              mirroredRow(mirrorLayout),
              index < items.length - 1 && styles.divider,
            ]}
          >
            <View style={styles.avatar}>
              <Text style={[styles.avatarLetter, { fontFamily: initialFont }]}>
                {initial}
              </Text>
            </View>
            <View style={styles.body}>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.meta} numberOfLines={1}>
                {label} ·{' '}
                <Text style={[styles.time, ltrText]}>{formatTime24(item.timestamp)}</Text>
              </Text>
            </View>
            {canManage ? (
              <Pressable
                disabled={!canCover || busyKey === item.key}
                style={[styles.pillBtn, (!canCover || busyKey === item.key) && styles.pillDisabled]}
                onPress={() => {
                  setBusyKey(item.key);
                  void onCover({
                    deviceUserId: item.deviceUserId,
                    date: item.date,
                    timestamp: item.timestamp,
                    type: item.type,
                  }).finally(() => setBusyKey(null));
                }}
              >
                {busyKey === item.key ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.pillText}>{t('holidays.coverPill')}</Text>
                )}
              </Pressable>
            ) : null}
          </View>
        );
      })}
    </HomeGlassCard>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const muted = isDark ? '#94A3B8' : '#64748B';
  const divider = isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.08)';

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    divider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: divider,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(245, 158, 11, 0.24)' : 'rgba(245, 158, 11, 0.16)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarLetter: { fontSize: 16, color: '#D97706' },
    body: { flex: 1, minWidth: 0 },
    name: {
      fontFamily: typography.noto.bold,
      fontSize: 14,
      color: text,
    },
    meta: {
      fontFamily: typography.noto.medium,
      fontSize: 12,
      color: muted,
      marginTop: 2,
    },
    time: {
      fontFamily: typography.inter.bold,
      fontVariant: ['tabular-nums'],
    },
    pillBtn: {
      backgroundColor: '#D97706',
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      minWidth: 72,
      alignItems: 'center',
    },
    pillDisabled: { opacity: 0.45 },
    pillText: {
      fontFamily: typography.noto.bold,
      fontSize: 12,
      color: '#FFFFFF',
    },
  });
}
