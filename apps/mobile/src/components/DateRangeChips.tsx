import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { copy } from '../copy/attendance';
import {
  getQuickRange,
  isFilterActive,
} from '../attendance/formatters';
import type { DateFilter, QuickRangeKey } from '../types/attendance';

const RANGES: { key: QuickRangeKey; label: string }[] = [
  { key: 'today', label: copy.dateFilter.today },
  { key: 'yesterday', label: copy.dateFilter.yesterday },
  { key: 'week', label: copy.dateFilter.thisWeek },
  { key: 'month', label: copy.dateFilter.thisMonth },
];

export function DateRangeChips({
  filter,
  onChange,
}: {
  filter: DateFilter;
  onChange: (filter: DateFilter) => void;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{copy.dateFilter.label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {RANGES.map((range) => {
          const active = isFilterActive(filter, range.key);
          return (
            <Pressable
              key={range.key}
              onPress={() => {
                const next = getQuickRange(range.key);
                onChange({ fromDate: next.from, toDate: next.to });
              }}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {range.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <Text style={styles.bounds}>
        {copy.dateFilter.from} {filter.fromDate} · {copy.dateFilter.to}{' '}
        {filter.toDate}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, paddingBottom: 8 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155' },
  chip: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#ffedd5' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#c2410c' },
  bounds: { fontSize: 12, color: '#94a3b8' },
});
