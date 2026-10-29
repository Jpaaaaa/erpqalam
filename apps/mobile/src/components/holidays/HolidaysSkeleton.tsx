import { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { HomeGlassCard } from '../home/HomeGlassCard';

export function HolidaysSkeleton() {
  const { isDark } = useHomeTheme();
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  return (
    <View style={styles.wrap}>
      <View style={styles.calendar} />
      <HomeGlassCard padding={16}>
        <View style={styles.line} />
        <View style={styles.line} />
        <View style={styles.line} />
      </HomeGlassCard>
    </View>
  );
}

function createStyles(isDark: boolean) {
  const bone = isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(15, 23, 42, 0.08)';

  return StyleSheet.create({
    wrap: { gap: 16 },
    calendar: {
      height: 280,
      borderRadius: 28,
      backgroundColor: bone,
      ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
    },
    line: {
      height: 52,
      borderRadius: 12,
      backgroundColor: bone,
      marginBottom: 10,
    },
  });
}
