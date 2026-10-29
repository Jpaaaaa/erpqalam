import { StyleSheet, View } from 'react-native';

function SkeletonBlock({ style }: { style?: object }) {
  return <View style={[styles.block, style]} />;
}

export function LoadingMetricsSkeleton({ count = 7 }: { count?: number }) {
  return (
    <View style={styles.metrics}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.card}>
          <SkeletonBlock style={styles.label} />
          <SkeletonBlock style={styles.value} />
        </View>
      ))}
    </View>
  );
}

export function LoadingListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={styles.listCard}>
          <SkeletonBlock style={styles.listTitle} />
          <SkeletonBlock style={styles.listLine} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
  },
  block: {
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
  },
  label: { height: 12, width: '70%', marginBottom: 8 },
  value: { height: 22, width: '40%' },
  list: { gap: 10, marginTop: 8 },
  listCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
  },
  listTitle: { height: 16, width: '55%', marginBottom: 8 },
  listLine: { height: 12, width: '85%' },
});
