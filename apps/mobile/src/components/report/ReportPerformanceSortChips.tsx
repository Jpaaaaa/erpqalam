import { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { mirroredRow } from '../../ui/rtlLayout';
import {
  GLASS_BORDER_DARK,
  GLASS_BORDER_LIGHT,
  GLASS_FILL_DARK,
  GLASS_FILL_LIGHT,
} from '../home/homeGlass';

export type PerformanceSortKey = 'attendance' | 'late' | 'absent';

const KEYS: PerformanceSortKey[] = ['attendance', 'late', 'absent'];

const LABEL: Record<PerformanceSortKey, string> = {
  attendance: 'report.sort.attendance',
  late: 'report.sort.late',
  absent: 'report.sort.absent',
};

export function ReportPerformanceSortChips({
  value,
  onChange,
}: {
  value: PerformanceSortKey;
  onChange: (key: PerformanceSortKey) => void;
}) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout, typography } = useI18n();
  const { isDark, palette } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography, palette.teal),
    [isDark, typography, palette.teal],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, mirroredRow(mirrorLayout)]}
    >
      {KEYS.map((key) => {
        const active = value === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={[styles.chip, active ? styles.chipActive : styles.chipGlass]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
              {t(LABEL[key])}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function createStyles(isDark: boolean, typography: AppTypography, teal: string) {
  const glassFill = isDark ? GLASS_FILL_DARK : GLASS_FILL_LIGHT;
  const glassBorder = isDark ? GLASS_BORDER_DARK : GLASS_BORDER_LIGHT;
  const muted = isDark ? '#94A3B8' : '#475569';

  return StyleSheet.create({
    row: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
    chip: {
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 1,
      ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
    },
    chipGlass: { backgroundColor: glassFill, borderColor: glassBorder },
    chipActive: { backgroundColor: teal, borderColor: teal },
    chipText: {
      fontFamily: typography.noto.medium,
      fontSize: 13,
      color: muted,
    },
    chipTextActive: {
      color: '#FFFFFF',
      fontFamily: typography.noto.bold,
    },
  });
}
