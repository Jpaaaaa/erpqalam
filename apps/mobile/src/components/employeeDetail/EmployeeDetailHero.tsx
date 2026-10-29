import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { DailyAttendanceRow, MergedAttendanceEmployee } from '../../types/attendance';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { ltrText } from '../../ui/ltr';
import { avatarStyleForToday } from '../employees/employeeFilters';
import { HomeGlassCard } from '../home/HomeGlassCard';
import { GLASS_INNER_CONTENT, GLASS_MUTED_DARK, GLASS_MUTED_LIGHT } from '../home/homeGlass';
import { formatTime24 } from '../../attendance/formatters';

function isLatinInitial(ch: string): boolean {
  return /^[A-Za-z0-9]$/.test(ch);
}

export function EmployeeDetailHero({
  name,
  deviceUserId,
  todayRow,
}: {
  name: string;
  deviceUserId: string;
  todayRow?: DailyAttendanceRow;
}) {
  const { isDark } = useHomeTheme();
  const { typography } = useI18n();
  const { t } = useTranslation('attendance');
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  const initial = (name.charAt(0) || '?').toUpperCase();
  const initialFont = isLatinInitial(initial)
    ? typography.inter.bold
    : typography.noto.bold;
  const employeeStub = {
    deviceUserId,
    name,
    isUnregistered: false,
  } as MergedAttendanceEmployee;
  const avatar = avatarStyleForToday(employeeStub, todayRow, isDark);

  const statusLabel = todayRow
    ? t(`daily.status.${todayRow.status}`)
    : t('daily.status.absent');

  return (
    <HomeGlassCard padding={20}>
      <View style={[styles.inner, GLASS_INNER_CONTENT]}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: avatar.bg },
          ]}
        >
          <Text style={[styles.avatarLetter, { fontFamily: initialFont, color: avatar.ink }]}>
            {initial}
          </Text>
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.idLine}>
          <Text style={styles.idHash}>#</Text>
          <Text style={styles.idNum}>{deviceUserId}</Text>
        </Text>
        <View style={styles.pillRow}>
          <View style={styles.statusPill}>
            <Text style={styles.statusPillText}>{statusLabel}</Text>
          </View>
        </View>
        <Text style={styles.timesLine}>
          {todayRow?.entryTime ? (
            <>
              {t('employeeDetail.in')}{' '}
              <Text style={styles.timeMono}>{formatTime24(todayRow.entryTime)}</Text>
            </>
          ) : (
            t('employeeDetail.noEntry')
          )}
          {' · '}
          {todayRow?.exitTime ? (
            <>
              {t('employeeDetail.out')}{' '}
              <Text style={styles.timeMono}>{formatTime24(todayRow.exitTime)}</Text>
            </>
          ) : (
            t('employeeDetail.noExit')
          )}
        </Text>
      </View>
    </HomeGlassCard>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const muted = isDark ? GLASS_MUTED_DARK : GLASS_MUTED_LIGHT;

  return StyleSheet.create({
    inner: { alignItems: 'center', gap: 8 },
    avatar: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    avatarLetter: { fontSize: 28, lineHeight: 34 },
    name: {
      fontFamily: typography.noto.bold,
      fontSize: 22,
      lineHeight: 30,
      color: text,
      textAlign: 'center',
    },
    idLine: { flexDirection: 'row', alignItems: 'center' },
    idHash: {
      fontFamily: typography.inter.bold,
      fontSize: 14,
      color: muted,
    },
    idNum: {
      fontFamily: typography.inter.bold,
      fontSize: 14,
      color: muted,
      fontVariant: ['tabular-nums'],
      ...ltrText,
    },
    pillRow: { marginTop: 4 },
    statusPill: {
      backgroundColor: isDark ? 'rgba(20, 184, 166, 0.2)' : 'rgba(20, 184, 166, 0.12)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
    },
    statusPillText: {
      fontFamily: typography.noto.medium,
      fontSize: 12,
      color: '#14B8A6',
    },
    timesLine: {
      fontFamily: typography.noto.medium,
      fontSize: 13,
      lineHeight: 20,
      color: muted,
      textAlign: 'center',
      marginTop: 4,
    },
    timeMono: {
      fontFamily: typography.inter.bold,
      fontVariant: ['tabular-nums'],
      ...ltrText,
    },
  });
}
