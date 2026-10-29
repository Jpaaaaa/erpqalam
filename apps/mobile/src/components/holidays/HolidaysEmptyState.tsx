import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';

export function HolidaysEmptyState({ message }: { message: string }) {
  const { isDark } = useHomeTheme();
  const { typography } = useI18n();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.iconWrap}>
        <Ionicons name="calendar-outline" size={28} color={styles.iconColor.color} />
      </View>
      <Text style={styles.label}>{message}</Text>
    </View>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const muted = isDark ? '#94A3B8' : '#64748B';

  return StyleSheet.create({
    wrap: {
      paddingVertical: 36,
      alignItems: 'center',
      gap: 12,
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: isDark ? 'rgba(148,163,184,0.12)' : 'rgba(15,23,42,0.06)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconColor: { color: muted },
    label: {
      fontFamily: typography.noto.medium,
      fontSize: 15,
      color: muted,
      textAlign: 'center',
      paddingHorizontal: 24,
    },
  });
}
