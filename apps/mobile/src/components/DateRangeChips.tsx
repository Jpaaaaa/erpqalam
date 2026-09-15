import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  getQuickRange,
  isFilterActive,
} from '../attendance/formatters';
import type { DateFilter, QuickRangeKey } from '../types/attendance';
import { useI18n } from '../i18n/I18nProvider';
import { AppText } from '../ui/AppText';
import { ltrText } from '../ui/ltr';
import { inlineEndGap, mirroredRow } from '../ui/rtlLayout';

const RANGE_KEYS: QuickRangeKey[] = ['today', 'yesterday', 'week', 'month'];

const RANGE_LABEL: Record<QuickRangeKey, string> = {
  today: 'dateFilter.today',
  yesterday: 'dateFilter.yesterday',
  week: 'dateFilter.thisWeek',
  month: 'dateFilter.thisMonth',
};

export function DateRangeChips({
  filter,
  onChange,
}: {
  filter: DateFilter;
  onChange: (filter: DateFilter) => void;
}) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout } = useI18n();
  return (
    <View style={styles.wrap}>
      <AppText style={styles.label}>{t('dateFilter.label')}</AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={mirroredRow(mirrorLayout)}
      >
        {RANGE_KEYS.map((key) => {
          const active = isFilterActive(filter, key);
          return (
            <Pressable
              key={key}
              onPress={() => {
                const next = getQuickRange(key);
                onChange({ fromDate: next.from, toDate: next.to });
              }}
              style={[
                styles.chip,
                inlineEndGap(mirrorLayout),
                active && styles.chipActive,
              ]}
            >
              <AppText style={[styles.chipText, active && styles.chipTextActive]}>
                {t(RANGE_LABEL[key])}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
      <AppText style={styles.bounds}>
        {t('dateFilter.from')}{' '}
        <AppText style={[styles.bounds, ltrText]}>{filter.fromDate}</AppText>
        {' · '}
        {t('dateFilter.to')}{' '}
        <AppText style={[styles.bounds, ltrText]}>{filter.toDate}</AppText>
      </AppText>
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
  },
  chipActive: { backgroundColor: '#ffedd5' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  chipTextActive: { color: '#c2410c' },
  bounds: { fontSize: 12, color: '#94a3b8' },
});
