import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { GLASS_MUTED_DARK, GLASS_MUTED_LIGHT } from '../home/homeGlass';

export function EmployeesEmptyState() {
  const { t } = useTranslation('attendance');
  const { typography } = useI18n();
  const { isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Ionicons
          name="people-outline"
          size={40}
          color={isDark ? GLASS_MUTED_DARK : GLASS_MUTED_LIGHT}
        />
      </View>
      <Text style={styles.label}>{t('employees.empty')}</Text>
    </View>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const muted = isDark ? GLASS_MUTED_DARK : GLASS_MUTED_LIGHT;

  return StyleSheet.create({
    wrap: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
      paddingHorizontal: 24,
      gap: 16,
    },
    iconCircle: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(15, 23, 42, 0.05)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontFamily: typography.noto.medium,
      fontSize: 15,
      lineHeight: 22,
      color: muted,
      textAlign: 'center',
    },
  });
}
