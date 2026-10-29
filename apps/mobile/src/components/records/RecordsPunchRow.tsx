import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatDisplayTime } from '../../attendance/formatters';
import type { AttendanceRecord, PunchType } from '../../types/attendance';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { ltrText } from '../../ui/ltr';
import { mirroredRow } from '../../ui/rtlLayout';
import { GLASS_MUTED_DARK, GLASS_MUTED_LIGHT } from '../home/homeGlass';

const PILL: Record<PunchType, { bg: string; ink: string; statusKey: string }> = {
  entry_on_time: { bg: 'rgba(20, 184, 166, 0.14)', ink: '#0D9488', statusKey: 'daily.status.on_time' },
  entry_late: { bg: 'rgba(245, 158, 11, 0.16)', ink: '#B45309', statusKey: 'daily.status.late' },
  exit: { bg: 'rgba(148, 163, 184, 0.2)', ink: '#64748B', statusKey: 'punchTypes.exit' },
  early_exit: { bg: 'rgba(249, 115, 22, 0.16)', ink: '#EA580C', statusKey: 'daily.status.early_exit' },
  out_of_shift: { bg: 'rgba(148, 163, 184, 0.2)', ink: '#64748B', statusKey: 'punchTypes.out_of_shift' },
};

function punchKindKey(punchType?: PunchType | null): 'records.punchIn' | 'records.punchOut' {
  if (punchType === 'exit' || punchType === 'early_exit' || punchType === 'out_of_shift') {
    return 'records.punchOut';
  }
  return 'records.punchIn';
}

function isLatinInitial(ch: string): boolean {
  return /^[A-Za-z0-9]$/.test(ch);
}

function avatarTint(name: string, isDark: boolean): { bg: string; ink: string } {
  const palette = [
    { bg: 'rgba(20, 184, 166, 0.22)', ink: '#0D9488' },
    { bg: 'rgba(59, 130, 246, 0.2)', ink: '#2563EB' },
    { bg: 'rgba(139, 92, 246, 0.2)', ink: '#7C3AED' },
    { bg: 'rgba(245, 158, 11, 0.22)', ink: '#B45309' },
  ];
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h + name.charCodeAt(i)) % palette.length;
  if (isDark) {
    return {
      bg: palette[h].bg.replace('0.22', '0.28').replace('0.2', '0.28'),
      ink: palette[h].ink,
    };
  }
  return palette[h];
}

export function RecordsPunchRow({
  record,
  name,
  onPress,
  isLast,
}: {
  record: AttendanceRecord;
  name: string;
  onPress?: () => void;
  isLast?: boolean;
}) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout, typography } = useI18n();
  const { isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  const initial = (name.charAt(0) || '?').toUpperCase();
  const initialFont = isLatinInitial(initial)
    ? typography.inter.bold
    : typography.noto.bold;
  const tint = avatarTint(name, isDark);
  const punchKey = record.punchType && record.punchType in PILL ? record.punchType : null;
  const pill = punchKey ? PILL[punchKey] : null;
  const pillLabel = pill ? t(pill.statusKey) : t('punchTypes.unknown');
  const kindLabel = t(punchKindKey(record.punchType));
  const pillStyle = pill ?? {
    bg: 'rgba(148, 163, 184, 0.2)',
    ink: '#64748B',
  };

  const row = (
    <View style={[styles.row, mirroredRow(mirrorLayout), !isLast && styles.rowDivider]}>
      <View style={[styles.avatar, { backgroundColor: tint.bg }]}>
        <Text style={[styles.avatarLetter, { fontFamily: initialFont, color: tint.ink }]}>
          {initial}
        </Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
          {name}
        </Text>
        <Text style={styles.punchType} numberOfLines={1}>
          {kindLabel}
        </Text>
      </View>
      <View style={styles.end}>
        <Text style={styles.time}>{formatDisplayTime(record.timestamp)}</Text>
        <View style={[styles.pill, { backgroundColor: pillStyle.bg }]}>
          <Text style={[styles.pillText, { color: pillStyle.ink }]} numberOfLines={1}>
            {pillLabel}
          </Text>
        </View>
      </View>
    </View>
  );

  if (!onPress) return row;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      {row}
    </Pressable>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const muted = isDark ? GLASS_MUTED_DARK : GLASS_MUTED_LIGHT;
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const divider = isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.08)';

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      backgroundColor: 'transparent',
    },
    rowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: divider,
    },
    pressed: { opacity: 0.88 },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarLetter: {
      fontSize: 16,
      lineHeight: 20,
    },
    body: {
      flex: 1,
      minWidth: 0,
      backgroundColor: 'transparent',
    },
    name: {
      fontFamily: typography.noto.medium,
      fontSize: 14,
      lineHeight: 20,
      color: text,
    },
    punchType: {
      fontFamily: typography.noto.medium,
      fontSize: 12,
      lineHeight: 18,
      color: muted,
      marginTop: 2,
    },
    end: {
      alignItems: 'flex-end',
      gap: 4,
      maxWidth: 112,
    },
    time: {
      fontFamily: typography.inter.bold,
      fontSize: 15,
      lineHeight: 18,
      color: text,
      fontVariant: ['tabular-nums'],
      ...ltrText,
    },
    pill: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      maxWidth: 112,
    },
    pillText: {
      fontFamily: typography.noto.medium,
      fontSize: 10,
      lineHeight: 13,
      textAlign: 'center',
    },
  });
}
