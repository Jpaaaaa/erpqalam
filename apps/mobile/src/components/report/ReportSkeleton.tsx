import { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { HomeGlassCard } from '../home/HomeGlassCard';

export function ReportSkeleton({
  variant,
}: {
  variant: 'performance' | 'per-employee' | 'per-employee-detail' | 'summary';
}) {
  const { isDark } = useHomeTheme();
  const styles = useMemo(() => createStyles(isDark), [isDark]);

  if (variant === 'summary') {
    return (
      <View style={styles.wrap}>
        <View style={styles.ringBone} />
        <View style={styles.tileRow}>
          <View style={styles.tile} />
          <View style={styles.tile} />
        </View>
      </View>
    );
  }

  if (variant === 'per-employee') {
    return (
      <View style={styles.wrap}>
        <View style={styles.pickerBone} />
        <View style={styles.ringBone} />
        <View style={styles.line} />
        <View style={styles.line} />
      </View>
    );
  }

  if (variant === 'per-employee-detail') {
    return (
      <View style={styles.wrap}>
        <View style={styles.ringBone} />
        <View style={styles.line} />
        <View style={styles.line} />
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.searchBone} />
      <View style={styles.chipsRow}>
        <View style={styles.chip} />
        <View style={styles.chip} />
      </View>
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
    searchBone: { height: 48, borderRadius: 24, backgroundColor: bone },
    chipsRow: { flexDirection: 'row', gap: 8 },
    chip: { width: 80, height: 38, borderRadius: 999, backgroundColor: bone },
    ringBone: {
      height: 140,
      borderRadius: 28,
      backgroundColor: bone,
      ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
    },
    pickerBone: { height: 68, borderRadius: 28, backgroundColor: bone },
    tileRow: { flexDirection: 'row', gap: 10 },
    tile: {
      flex: 1,
      height: 72,
      borderRadius: 28,
      backgroundColor: bone,
    },
    line: {
      height: 56,
      borderRadius: 12,
      backgroundColor: bone,
      marginBottom: 8,
    },
  });
}
