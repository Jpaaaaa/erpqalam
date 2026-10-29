import { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { HomeGlassCard } from '../home/HomeGlassCard';
import { GLASS_INNER_CONTENT } from '../home/homeGlass';

export function RecordsSkeleton() {
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
      {[0, 1, 2].map((key) => (
        <HomeGlassCard key={key} padding={16} style={styles.card}>
          <View style={[GLASS_INNER_CONTENT, styles.cardInner]}>
            <View style={styles.lineTitle} />
            <View style={styles.lineRow} />
            <View style={styles.lineRow} />
          </View>
        </HomeGlassCard>
      ))}
    </View>
  );
}

function createStyles(isDark: boolean) {
  const bone = isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(15, 23, 42, 0.08)';
  const boneStrong = isDark ? 'rgba(148, 163, 184, 0.22)' : 'rgba(15, 23, 42, 0.12)';

  return StyleSheet.create({
    wrap: { gap: 16 },
    search: {
      height: 48,
      borderRadius: 24,
      backgroundColor: bone,
      ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
    },
    chipsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    chip: {
      width: 72,
      height: 38,
      borderRadius: 999,
      backgroundColor: bone,
    },
    chipWide: {
      width: 96,
      height: 38,
      borderRadius: 999,
      backgroundColor: bone,
    },
    card: { marginBottom: 4 },
    cardInner: { gap: 12 },
    lineTitle: {
      height: 18,
      width: '55%',
      borderRadius: 6,
      backgroundColor: boneStrong,
    },
    lineRow: {
      height: 14,
      width: '90%',
      borderRadius: 6,
      backgroundColor: bone,
    },
  });
}
