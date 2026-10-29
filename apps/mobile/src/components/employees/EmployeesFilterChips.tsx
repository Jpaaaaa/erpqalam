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
import type { EmployeeStatusFilter } from './employeeFilters';

const FILTERS: EmployeeStatusFilter[] = [
  'all',
  'present',
  'late',
  'absent',
  'on_leave',
  'unregistered',
];

const LABEL_KEY: Record<EmployeeStatusFilter, string> = {
  all: 'employees.filters.all',
  present: 'employees.filters.present',
  late: 'employees.filters.late',
  absent: 'employees.filters.absent',
  on_leave: 'employees.filters.onLeave',
  unregistered: 'employees.filters.unregistered',
};

export function EmployeesFilterChips({
  value,
  onChange,
}: {
  value: EmployeeStatusFilter;
  onChange: (next: EmployeeStatusFilter) => void;
}) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout, typography } = useI18n();
  const { isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, mirroredRow(mirrorLayout)]}
    >
      {FILTERS.map((key) => {
        const active = value === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={[styles.chip, active ? styles.chipActive : styles.chipGlass]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1}>
              {t(LABEL_KEY[key])}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const glassFill = isDark ? GLASS_FILL_DARK : GLASS_FILL_LIGHT;
  const glassBorder = isDark ? GLASS_BORDER_DARK : GLASS_BORDER_LIGHT;
  const muted = isDark ? '#94A3B8' : '#475569';

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: 8,
      paddingVertical: 4,
    },
    chip: {
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 1,
      ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
    },
    chipGlass: {
      backgroundColor: glassFill,
      borderColor: glassBorder,
    },
    chipActive: {
      backgroundColor: '#14B8A6',
      borderColor: '#14B8A6',
    },
    chipText: {
      fontFamily: typography.noto.bold,
      fontSize: 13,
      lineHeight: 18,
      color: muted,
    },
    chipTextActive: {
      color: '#FFFFFF',
    },
  });
}
