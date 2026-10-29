import { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { HomeGlassCard } from '../home/HomeGlassCard';
import { GLASS_INNER_CONTENT } from '../home/homeGlass';

export function EmployeesSkeleton() {
  const { isDark } = useHomeTheme();
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  return (
    <View style={styles.wrap}>
      <View style={styles.search} />
      <View style={styles.chipsRow}>
        <View style={styles.chip} />
        <View style={styles.chip} />
        <View style={styles.chipWide} />
      </View>
      <HomeGlassCard padding={16}>
        <View style={[GLASS_INNER_CONTENT, styles.cardInner]}>
          <View style={styles.lineRow} />
          <View style={styles.lineRow} />
          <View style={styles.lineRow} />
          <View style={styles.lineRow} />
        </View>
      </HomeGlassCard>
    </View>
  );
}

function createStyles(isDark: boolean) {
  const bone = isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(15, 23, 42, 0.08)';

  return StyleSheet.create({
    wrap: { gap: 16 },
    search: {
      height: 48,
      borderRadius: 24,
      backgroundColor: bone,
      ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
    },
    chipsRow: { flexDirection: 'row', gap: 8 },
    chip: { width: 72, height: 38, borderRadius: 999, backgroundColor: bone },
    chipWide: { width: 88, height: 38, borderRadius: 999, backgroundColor: bone },
    cardInner: { gap: 14 },
    lineRow: {
      height: 44,
      borderRadius: 8,
      backgroundColor: bone,
    },
  });
}
