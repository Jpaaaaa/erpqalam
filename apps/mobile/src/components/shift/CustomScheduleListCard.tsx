import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  employeeUsesGlobalSchedule,
  scheduleFromUser,
} from '../../attendance/scheduleModel';
import { displayName } from '../../attendance/formatters';
import { formatWallClockTime12h } from '../../attendance/wallClockTime';
import type { AttendanceSettings, AttendanceUser } from '../../types/attendance';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { HomeGlassCard } from '../home/HomeGlassCard';
import { ltrText } from '../../ui/ltr';
import { mirroredRow } from '../../ui/rtlLayout';

function isLatinInitial(ch: string): boolean {
  return /^[A-Za-z0-9]$/.test(ch);
}

export function CustomScheduleListCard({
  users,
  globalSettings,
  onPressUser,
}: {
  users: AttendanceUser[];
  globalSettings: AttendanceSettings;
  onPressUser: (deviceUserId: string, name: string) => void;
}) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout, typography } = useI18n();
  const am = t('settings.timeAm');
  const pm = t('settings.timePm');
  const { isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  const custom = useMemo(
    () => users.filter((u) => !employeeUsesGlobalSchedule(u)),
    [users],
  );

  if (custom.length === 0) {
    return (
      <HomeGlassCard>
        <Text style={styles.title}>{t('shift.customSchedules')}</Text>
        <Text style={styles.empty}>{t('shift.noCustomSchedules')}</Text>
      </HomeGlassCard>
    );
  }

  return (
    <HomeGlassCard padding={0}>
      <Text style={[styles.title, styles.titlePad]}>{t('shift.customSchedules')}</Text>
      {custom.map((user, index) => {
        const name = displayName(user.name, user.deviceUserId);
        const initial = (name.charAt(0) || '?').toUpperCase();
        const initialFont = isLatinInitial(initial)
          ? typography.inter.bold
          : typography.noto.bold;
        const sched = scheduleFromUser(user, globalSettings);
        const times = `${formatWallClockTime12h(sched.shiftStartTime, am, pm)} → ${formatWallClockTime12h(sched.shiftEndTime, am, pm)}`;
        const isLast = index === custom.length - 1;
        return (
          <Pressable
            key={user.deviceUserId}
            onPress={() => onPressUser(user.deviceUserId, name)}
            style={({ pressed }) => [
              styles.row,
              mirroredRow(mirrorLayout),
              !isLast && styles.rowBorder,
              pressed && styles.rowPressed,
            ]}
          >
            <View style={styles.avatar}>
              <Text style={[styles.avatarText, { fontFamily: initialFont }]}>
                {initial}
              </Text>
            </View>
            <View style={styles.body}>
              <Text style={styles.name} numberOfLines={1}>
                {name}
              </Text>
              <Text style={[styles.times, ltrText]}>{times}</Text>
            </View>
          </Pressable>
        );
      })}
    </HomeGlassCard>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const muted = isDark ? '#94A3B8' : '#64748B';

  return StyleSheet.create({
    title: {
      fontFamily: typography.noto.bold,
      fontSize: 16,
      color: text,
    },
    titlePad: { padding: 16, paddingBottom: 8 },
    empty: {
      fontFamily: typography.noto.medium,
      fontSize: 14,
      color: muted,
      marginTop: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    rowBorder: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDark ? 'rgba(148,163,184,0.2)' : 'rgba(15,23,42,0.06)',
    },
    rowPressed: { opacity: 0.85 },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.25)' : 'rgba(37, 99, 235, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { fontSize: 18, color: isDark ? '#93C5FD' : '#2563EB' },
    body: { flex: 1, gap: 2 },
    name: {
      fontFamily: typography.noto.bold,
      fontSize: 15,
      color: text,
    },
    times: {
      fontFamily: typography.inter.semibold,
      fontSize: 14,
      color: muted,
      fontVariant: ['tabular-nums'],
    },
  });
}
