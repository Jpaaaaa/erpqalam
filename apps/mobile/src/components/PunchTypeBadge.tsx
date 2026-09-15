import { StyleSheet, Text, View } from 'react-native';
import { copy } from '../copy/attendance';
import type { PunchType } from '../types/attendance';

const COLORS: Record<PunchType, { bg: string; fg: string }> = {
  entry_on_time: { bg: '#d1fae5', fg: '#065f46' },
  entry_late: { bg: '#fef3c7', fg: '#92400e' },
  exit: { bg: '#f1f5f9', fg: '#334155' },
  early_exit: { bg: '#ffedd5', fg: '#9a3412' },
  out_of_shift: { bg: '#f1f5f9', fg: '#64748b' },
};

export function PunchTypeBadge({ punchType }: { punchType?: PunchType | null }) {
  const key = punchType && punchType in COLORS ? punchType : null;
  const label = key ? copy.punchTypes[key] : copy.punchTypes.unknown;
  const colors = key ? COLORS[key] : { bg: '#f1f5f9', fg: '#64748b' };
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: { fontSize: 12, fontWeight: '600' },
});
