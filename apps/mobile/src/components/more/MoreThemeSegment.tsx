import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import type { HomeThemePreference } from '../../theme/homeTheme';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { mirroredRow } from '../../ui/rtlLayout';

const OPTIONS: HomeThemePreference[] = ['light', 'dark', 'system'];

const LABEL: Record<HomeThemePreference, string> = {
  light: 'more.themeLight',
  dark: 'more.themeDark',
  system: 'more.themeSystem',
};

export function MoreThemeSegment() {
  const { t } = useTranslation('attendance');
  const { preference, setPreference, isDark, palette } = useHomeTheme();
  const { mirrorLayout, typography } = useI18n();
  const styles = useMemo(
    () => createStyles(isDark, typography, palette.teal),
    [isDark, typography, palette.teal],
  );

  return (
    <View style={[styles.row, mirroredRow(mirrorLayout)]}>
      {OPTIONS.map((opt) => {
        const active = preference === opt;
        return (
          <Pressable
            key={opt}
            style={[styles.pill, active && styles.pillActive]}
            onPress={() => void setPreference(opt)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.pillText, active && styles.pillTextActive]} numberOfLines={1}>
              {t(LABEL[opt])}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(isDark: boolean, typography: AppTypography, teal: string) {
  const muted = isDark ? '#94A3B8' : '#64748B';
  const track = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15, 23, 42, 0.06)';

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      flexShrink: 1,
      justifyContent: 'flex-end',
    },
    pill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: track,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    pillActive: {
      backgroundColor: isDark ? 'rgba(20, 184, 166, 0.22)' : '#CCFBF1',
      borderColor: teal,
    },
    pillText: {
      fontFamily: typography.noto.medium,
      fontSize: 11,
      color: muted,
    },
    pillTextActive: {
      color: isDark ? '#5EEAD4' : '#0F766E',
    },
  });
}
