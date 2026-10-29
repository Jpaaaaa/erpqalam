import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';

export function DailyEmptyState() {
  const { t } = useTranslation('attendance');
  const { isDark } = useHomeTheme();
  const { typography } = useI18n();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{t('daily.empty')}</Text>
    </View>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const muted = isDark ? '#94A3B8' : '#64748B';

  return StyleSheet.create({
    wrap: {
      paddingVertical: 32,
      alignItems: 'center',
    },
    label: {
      fontFamily: typography.noto.medium,
      fontSize: 15,
      color: muted,
      textAlign: 'center',
    },
  });
}
