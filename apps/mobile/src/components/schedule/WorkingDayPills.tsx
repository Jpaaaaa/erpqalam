import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WORKING_DAY_KEYS } from '../../attendance/scheduleModel';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';

export function WorkingDayPills({
  value,
  onChange,
  disabled,
}: {
  value: number[];
  onChange: (days: number[]) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslation('attendance');
  const { typography } = useI18n();
  const { isDark, palette } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography, palette.teal),
    [isDark, typography, palette.teal],
  );

  function toggle(day: number) {
    if (disabled) return;
    const set = new Set(value);
    if (set.has(day)) set.delete(day);
    else set.add(day);
    onChange(Array.from(set).sort((a, b) => a - b));
  }

  return (
    <View style={styles.row}>
      {WORKING_DAY_KEYS.map((day) => {
        const active = value.includes(day);
        return (
          <Pressable
            key={day}
            disabled={disabled}
            onPress={() => toggle(day)}
            style={[styles.pill, active && styles.pillActive]}
          >
            <Text style={[styles.pillText, active && styles.pillTextActive]}>
              {t(`settings.days.${day}`)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(isDark: boolean, typography: AppTypography, teal: string) {
  const muted = isDark ? '#94A3B8' : '#64748B';

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    pill: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(15, 23, 42, 0.08)',
      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.35)' : 'rgba(255,255,255,0.45)',
    },
    pillActive: {
      backgroundColor: isDark ? 'rgba(20, 184, 166, 0.25)' : 'rgba(20, 184, 166, 0.15)',
      borderColor: teal,
    },
    pillText: {
      fontFamily: typography.noto.bold,
      fontSize: 12,
      color: muted,
    },
    pillTextActive: {
      color: isDark ? '#5EEAD4' : '#0F766E',
    },
  });
}
