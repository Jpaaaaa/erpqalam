import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PunchTypeBadge } from './PunchTypeBadge';
import {
  formatDisplayDate,
  formatDisplayTime,
} from '../attendance/formatters';
import { copy } from '../copy/attendance';
import type { AttendanceRecord } from '../types/attendance';

export function PunchRow({
  record,
  name,
  deviceName,
  onPress,
}: {
  record: AttendanceRecord;
  name: string;
  deviceName: string;
  onPress?: () => void;
}) {
  const content = (
    <View style={styles.card}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.id}>{record.deviceUserId}</Text>
      <View style={styles.meta}>
        <Text style={styles.metaText}>
          {copy.records.date} {formatDisplayDate(record.timestamp.slice(0, 10))}
        </Text>
        <Text style={styles.metaText}>
          {copy.records.time} {formatDisplayTime(record.timestamp)}
        </Text>
      </View>
      <View style={styles.footer}>
        <PunchTypeBadge punchType={record.punchType} />
        <Text style={styles.device} numberOfLines={1}>
          {copy.records.device} {deviceName}
        </Text>
      </View>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return <Pressable onPress={onPress}>{content}</Pressable>;
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  name: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  id: { fontSize: 13, color: '#64748b', marginTop: 2 },
  meta: { flexDirection: 'row', gap: 12, marginTop: 8 },
  metaText: { fontSize: 13, color: '#475569' },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  device: { flex: 1, textAlign: 'right', fontSize: 12, color: '#94a3b8' },
});
