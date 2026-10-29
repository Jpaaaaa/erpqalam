import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { displayName, formatTime24 } from '../../attendance/formatters';
import { avatarStyleForToday } from '../employees/employeeFilters';
import type { DailyAttendanceRow, MergedAttendanceEmployee } from '../../types/attendance';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { HomeGlassCard } from '../home/HomeGlassCard';
import { GLASS_MUTED_DARK, GLASS_MUTED_LIGHT } from '../home/homeGlass';
import { ltrText } from '../../ui/ltr';
import { mirroredRow } from '../../ui/rtlLayout';

function isLatinInitial(ch: string): boolean {
  return /^[A-Za-z0-9]$/.test(ch);
}

function statusPillColors(
  status: DailyAttendanceRow['status'],
  isDark: boolean,
): { bg: string; ink: string } {
  switch (status) {
    case 'on_time':
      return {
        bg: isDark ? 'rgba(20, 184, 166, 0.22)' : 'rgba(20, 184, 166, 0.14)',
        ink: isDark ? '#5EEAD4' : '#0F766E',
      };
    case 'late':
      return {
        bg: isDark ? 'rgba(245, 158, 11, 0.22)' : 'rgba(245, 158, 11, 0.16)',
        ink: isDark ? '#FCD34D' : '#B45309',
      };
    case 'early_exit':
      return {
        bg: isDark ? 'rgba(249, 115, 22, 0.22)' : 'rgba(249, 115, 22, 0.14)',
        ink: isDark ? '#FDBA74' : '#EA580C',
      };
    case 'absent':
      return {
        bg: isDark ? 'rgba(239, 68, 68, 0.22)' : 'rgba(239, 68, 68, 0.12)',
        ink: isDark ? '#FCA5A5' : '#DC2626',
      };
    case 'on_leave':
      return {
        bg: isDark ? 'rgba(139, 92, 246, 0.22)' : 'rgba(139, 92, 246, 0.14)',
        ink: isDark ? '#C4B5FD' : '#6D28D9',
      };
    case 'official_holiday':
      return {
        bg: isDark ? 'rgba(99, 102, 241, 0.22)' : 'rgba(99, 102, 241, 0.12)',
        ink: isDark ? '#A5B4FC' : '#4338CA',
      };
    default:
      return {
        bg: isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(148, 163, 184, 0.12)',
        ink: isDark ? '#94A3B8' : '#64748B',
      };
  }
}

function timeRange(row: DailyAttendanceRow): string {
  const inT = row.entryTime ? formatTime24(row.entryTime) : '—';
  const outT = row.exitTime ? formatTime24(row.exitTime) : '—';
  return `${inT} → ${outT}`;
}

export function DailyListCard({
  rows,
  nameLookup,
  onPressRow,
}: {
  rows: DailyAttendanceRow[];
  nameLookup: Map<string, string>;
  onPressRow: (deviceUserId: string, name: string) => void;
}) {
  const { isDark } = useHomeTheme();

  return (
    <HomeGlassCard padding={0}>
      {rows.map((row, index) => (
        <DailyRow
          key={row.deviceUserId}
          row={row}
          isLast={index === rows.length - 1}
          isDark={isDark}
          name={displayName(nameLookup.get(row.deviceUserId), row.deviceUserId)}
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

function DailyRow({
  row,
  name,
  isLast,
  isDark,
  onPress,
}: {
  row: DailyAttendanceRow;
  name: string;
  isLast: boolean;
  isDark: boolean;
  onPress: () => void;
}) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout, typography } = useI18n();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  const stub = {
    deviceUserId: row.deviceUserId,
    name,
    isUnregistered: false,
  } as MergedAttendanceEmployee;
  const avatar = avatarStyleForToday(stub, row, isDark);
  const initial = (name.charAt(0) || '?').toUpperCase();
  const initialFont = isLatinInitial(initial)
    ? typography.inter.bold
    : typography.noto.bold;
  const pill = statusPillColors(row.status, isDark);

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
      <View style={[styles.avatar, { backgroundColor: avatar.bg }]}>
        <Text style={[styles.avatarLetter, { fontFamily: initialFont, color: avatar.ink }]}>
          {initial}
        </Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.idLine} numberOfLines={1}>
          <Text style={styles.idHash}>#</Text>
          <Text style={[styles.idNum, ltrText]}>{row.deviceUserId}</Text>
        </Text>
        <Text style={[styles.times, ltrText]} numberOfLines={1}>
          {timeRange(row)}
        </Text>
      </View>
      <View style={[styles.pill, { backgroundColor: pill.bg }]}>
        <Text style={[styles.pillText, { color: pill.ink }]} numberOfLines={1}>
          {t(`daily.status.${row.status}`)}
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
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: 72,
    },
    divider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: divider,
    },
    pressed: { opacity: 0.9 },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarLetter: { fontSize: 16 },
    body: { flex: 1, minWidth: 0, gap: 2 },
    name: {
      fontFamily: typography.noto.bold,
      fontSize: 14,
      lineHeight: 20,
      color: text,
    },
    idLine: { flexDirection: 'row', alignItems: 'center' },
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
    times: {
      fontFamily: typography.inter.bold,
      fontSize: 14,
      lineHeight: 18,
      color: text,
      fontVariant: ['tabular-nums'],
      marginTop: 2,
    },
    pill: {
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 4,
      maxWidth: 96,
    },
    pillText: {
      fontFamily: typography.noto.medium,
      fontSize: 10,
      lineHeight: 14,
      textAlign: 'center',
    },
  });
}
