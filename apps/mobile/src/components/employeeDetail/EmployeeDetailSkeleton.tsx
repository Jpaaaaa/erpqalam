import { Platform, StyleSheet, View } from 'react-native';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { HomeGlassCard } from '../home/HomeGlassCard';

export function EmployeeDetailSkeleton() {
  const { isDark } = useHomeTheme();
  const bone = isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(15, 23, 42, 0.08)';

  return (
    <View style={styles.wrap}>
      <HomeGlassCard padding={20}>
        <View style={[styles.avatar, { backgroundColor: bone }]} />
        <View style={[styles.line, { width: '60%', backgroundColor: bone }]} />
        <View style={[styles.lineSm, { backgroundColor: bone }]} />
      </HomeGlassCard>
      <View style={[styles.chips, { backgroundColor: bone }]} />
      <HomeGlassCard padding={16}>
        <View style={[styles.ring, { backgroundColor: bone }]} />
        <View style={styles.grid}>
          {[0, 1, 2, 3, 4, 5].map((k) => (
            <View key={k} style={[styles.tile, { backgroundColor: bone }]} />
          ))}
        </View>
      </HomeGlassCard>
      <HomeGlassCard padding={16}>
        <View style={[styles.line, { backgroundColor: bone }]} />
        <View style={[styles.line, { backgroundColor: bone }]} />
      </HomeGlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignSelf: 'center',
    marginBottom: 12,
  },
  line: {
    height: 16,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 8,
  },
  lineSm: {
    height: 12,
    width: '40%',
    borderRadius: 6,
    alignSelf: 'center',
  },
  chips: {
    height: 38,
    borderRadius: 999,
    ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
  },
  ring: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 16,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: '47%',
    height: 64,
    borderRadius: 16,
  },
});
