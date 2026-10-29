import { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { HomeGlassCard } from '../home/HomeGlassCard';

export function DailySkeleton() {
  const { isDark } = useHomeTheme();
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  return (
    <View style={styles.wrap}>
      <View style={styles.strip} />
      <HomeGlassCard padding={16}>
        <View style={styles.summaryRow}>
          <View style={styles.ring} />
          <View style={styles.stats}>
            <View style={styles.stat} />
            <View style={styles.stat} />
            <View style={styles.stat} />
          </View>
        </View>
      </HomeGlassCard>
      <View style={styles.chipsRow}>
        <View style={styles.chip} />
        <View style={styles.chip} />
        <View style={styles.chipWide} />
      </View>
      <View style={styles.search} />
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
    strip: {
      height: 88,
      borderRadius: 16,
      backgroundColor: bone,
      ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
    },
    summaryRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
    ring: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: bone,
    },
    stats: { flex: 1, flexDirection: 'row', gap: 8 },
    stat: {
      flex: 1,
      height: 44,
      borderRadius: 8,
      backgroundColor: bone,
    },
    chipsRow: { flexDirection: 'row', gap: 8 },
    chip: { width: 64, height: 38, borderRadius: 999, backgroundColor: bone },
    chipWide: { width: 88, height: 38, borderRadius: 999, backgroundColor: bone },
    search: {
      height: 48,
      borderRadius: 24,
      backgroundColor: bone,
    },
    line: {
      height: 64,
      borderRadius: 8,
      backgroundColor: bone,
      marginBottom: 10,
    },
  });
}
