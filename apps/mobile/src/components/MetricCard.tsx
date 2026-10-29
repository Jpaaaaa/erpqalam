import { StyleSheet, View } from 'react-native';
import { AppText } from '../ui/AppText';

export function MetricCard({
  label,
  value,
  footer,
}: {
  label: string;
  value: string | number;
  footer?: string;
}) {
  return (
    <View style={styles.card}>
      <AppText style={styles.label}>{label}</AppText>
      <AppText style={styles.value}>{String(value)}</AppText>
      {footer ? <AppText style={styles.footer}>{footer}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  label: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  value: { fontSize: 22, fontWeight: '700', color: '#0f172a', marginTop: 4 },
  footer: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
});
