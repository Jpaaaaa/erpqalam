import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { EmployeeReportRow } from '../../types/attendance';
import { displayName } from '../../attendance/formatters';
import { avatarStyleForToday } from '../employees/employeeFilters';
import type { MergedAttendanceEmployee } from '../../types/attendance';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { HomeGlassCard } from '../home/HomeGlassCard';
import { GLASS_MUTED_DARK, GLASS_MUTED_LIGHT } from '../home/homeGlass';
import { ltrText } from '../../ui/ltr';
import { mirroredRow } from '../../ui/rtlLayout';
import { attendancePctColor, rowAttendancePct } from './reportPerformance';

function isLatinInitial(ch: string): boolean {
  return /^[A-Za-z0-9]$/.test(ch);
}

export function ReportLeaderboardCard({
  rows,
  nameLookup,
  balanceLookup,
  onPressRow,
}: {
  rows: EmployeeReportRow[];
  nameLookup: Map<string, string>;
  balanceLookup: Map<string, number>;
  onPressRow: (deviceUserId: string, name: string) => void;
}) {
  return (
    <HomeGlassCard padding={0}>
      {rows.map((row, index) => (
        <LeaderboardRow
          key={row.deviceUserId}
          row={row}
          rank={index + 1}
          isLast={index === rows.length - 1}
          name={displayName(nameLookup.get(row.deviceUserId), row.deviceUserId)}
          balance={balanceLookup.get(row.deviceUserId) ?? 0}
          onPress={() =>
            onPressRow(
              row.deviceUserId,
              displayName(nameLookup.get(row.deviceUserId), row.deviceUserId),
            )
          }
        />
      ))}
    </HomeGlassCard>
  );
}

function LeaderboardRow({
  row,
  rank,
  isLast,
  name,
  balance,
  onPress,
}: {
  row: EmployeeReportRow;
  rank: number;
  isLast: boolean;
  name: string;
  balance: number;
  onPress: () => void;
}) {
  const { t } = useTranslation('attendance');
  const { isDark } = useHomeTheme();
  const { mirrorLayout, typography } = useI18n();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  const pct = rowAttendancePct(row);
  const pctColor = attendancePctColor(pct);
  const stub = {
    deviceUserId: row.deviceUserId,
    name,
    isUnregistered: false,
  } as MergedAttendanceEmployee;
  const avatar = avatarStyleForToday(stub, undefined, isDark);
  const initial = (name.charAt(0) || '?').toUpperCase();
  const initialFont = isLatinInitial(initial)
    ? typography.inter.bold
    : typography.noto.bold;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        mirroredRow(mirrorLayout),
        !isLast && styles.divider,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.rank, ltrText]}>{rank}</Text>
      <View style={[styles.avatar, { backgroundColor: avatar.bg }]}>
        <Text style={[styles.avatarLetter, { fontFamily: initialFont, color: avatar.ink }]}>
          {initial}
        </Text>
      </View>
      <View style={styles.body}>
        <View style={[styles.nameRow, mirroredRow(mirrorLayout)]}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[styles.pct, ltrText, { color: pctColor }]}>
            {pct}%
          </Text>
        </View>
        <Text style={styles.idLine} numberOfLines={1}>
          <Text style={styles.idHash}>#</Text>
          <Text style={[styles.idNum, ltrText]}>{row.deviceUserId}</Text>
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: pctColor }]} />
        </View>
        <Text style={styles.stats} numberOfLines={1}>
          {t('report.leaderboardStats', {
            late: row.lateCount,
            absent: row.daysAbsent,
          })}
        </Text>
      </View>
      <View style={styles.leavePill}>
        <Text style={styles.leavePillText} numberOfLines={1}>
          {t('report.leaveShort', { days: balance })}
        </Text>
      </View>
    </Pressable>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const muted = isDark ? GLASS_MUTED_DARK : GLASS_MUTED_LIGHT;
  const divider = isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.08)';

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    divider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: divider,
    },
    pressed: { opacity: 0.9 },
    rank: {
      fontFamily: typography.inter.bold,
      fontSize: 14,
      lineHeight: 20,
      color: muted,
      width: 22,
      marginTop: 10,
      fontVariant: ['tabular-nums'],
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    avatarLetter: { fontSize: 16 },
    body: { flex: 1, minWidth: 0, gap: 2 },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    name: {
      fontFamily: typography.noto.bold,
      fontSize: 14,
      lineHeight: 20,
      color: text,
      flex: 1,
    },
    pct: {
      fontFamily: typography.inter.extraBold,
      fontSize: 17,
      lineHeight: 22,
      fontVariant: ['tabular-nums'],
    },
    idLine: { flexDirection: 'row' },
    idHash: {
      fontFamily: typography.inter.bold,
      fontSize: 12,
      color: muted,
    },
    idNum: {
      fontFamily: typography.inter.bold,
      fontSize: 12,
      color: muted,
      fontVariant: ['tabular-nums'],
    },
    progressTrack: {
      height: 3,
      borderRadius: 2,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)',
      marginTop: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 2,
      maxWidth: '100%',
    },
    stats: {
      fontFamily: typography.noto.medium,
      fontSize: 12,
      lineHeight: 16,
      color: muted,
      marginTop: 2,
    },
    leavePill: {
      marginTop: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: isDark ? 'rgba(139, 92, 246, 0.22)' : 'rgba(139, 92, 246, 0.14)',
      maxWidth: 72,
    },
    leavePillText: {
      fontFamily: typography.noto.medium,
      fontSize: 10,
      color: isDark ? '#C4B5FD' : '#6D28D9',
      textAlign: 'center',
    },
  });
}
