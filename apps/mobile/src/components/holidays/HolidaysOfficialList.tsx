import { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { HolidayRangeGroup } from '../../attendance/holidayRanges';
import { formatHolidayDateRangeWords } from '../../attendance/holidayFormatters';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { HomeGlassCard } from '../home/HomeGlassCard';
import { holidayTypeTileBg, holidayTypeColor } from './holidayColors';
import { mirroredRow } from '../../ui/rtlLayout';

const TYPE_ICON: Record<
  HolidayRangeGroup['type'],
  keyof typeof Ionicons.glyphMap
> = {
  day_off: 'moon-outline',
  entry_late: 'time-outline',
  early_exit: 'exit-outline',
};

export function HolidaysOfficialList({
  ranges,
  canManage,
  onDeleteRange,
}: {
  ranges: HolidayRangeGroup[];
  canManage: boolean;
  onDeleteRange: (ids: string[]) => Promise<void>;
}) {
  const { t } = useTranslation('attendance');
  const { locale, mirrorLayout, typography } = useI18n();
  const { isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  function confirmDelete(group: HolidayRangeGroup) {
    Alert.alert(t('holidays.removeConfirmTitle'), t('holidays.removeConfirmMessage'), [
      { text: t('records.cancel'), style: 'cancel' },
      {
        text: t('holidays.remove'),
        style: 'destructive',
        onPress: () => void onDeleteRange(group.ids),
      },
    ]);
  }

  return (
    <HomeGlassCard padding={0}>
      {ranges.map((group, index) => {
        const isLast = index === ranges.length - 1;
        const color = holidayTypeColor(group.type);
        return (
          <Pressable
            key={`${group.fromDate}-${group.type}`}
            onLongPress={canManage ? () => confirmDelete(group) : undefined}
            style={({ pressed }) => [
              styles.row,
              mirroredRow(mirrorLayout),
              !isLast && styles.divider,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.iconTile, { backgroundColor: holidayTypeTileBg(group.type, isDark) }]}>
              <Ionicons name={TYPE_ICON[group.type]} size={20} color={color} />
            </View>
            <View style={styles.body}>
              <Text style={styles.dateLine}>
                {formatHolidayDateRangeWords(locale, group.fromDate, group.toDate)}
              </Text>
              <Text style={styles.typeLabel}>{t(`holidays.types.${group.type}`)}</Text>
            </View>
            <View style={styles.countPill}>
              <Text style={styles.countText}>{group.dayCount}</Text>
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
  const divider = isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.08)';

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    divider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: divider,
    },
    pressed: { opacity: 0.9 },
    iconTile: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: { flex: 1, minWidth: 0, gap: 2 },
    dateLine: {
      fontFamily: typography.noto.bold,
      fontSize: 14,
      color: text,
    },
    typeLabel: {
      fontFamily: typography.noto.medium,
      fontSize: 12,
      color: muted,
    },
    countPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: isDark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.08)',
    },
    countText: {
      fontFamily: typography.inter.bold,
      fontSize: 13,
      color: text,
      fontVariant: ['tabular-nums'],
    },
  });
}
