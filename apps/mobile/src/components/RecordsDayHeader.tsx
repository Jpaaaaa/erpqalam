import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { formatDisplayDate } from '../attendance/formatters';
import type { DailyAttendanceSummary } from '../types/attendance';
import { AppText } from '../ui/AppText';
import { ltrText } from '../ui/ltr';
import { useI18n } from '../i18n/I18nProvider';
import { mirroredRow } from '../ui/rtlLayout';

export function RecordsDayHeader({
  date,
  summary,
  expanded,
  onToggle,
}: {
  date: string;
  summary?: DailyAttendanceSummary;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout } = useI18n();

  return (
    <Pressable
      onPress={onToggle}
      style={[styles.wrap, mirroredRow(mirrorLayout)]}
    >
      <View style={styles.titleBlock}>
        <AppText style={[styles.date, ltrText]}>{formatDisplayDate(date)}</AppText>
        {summary ? (
          <AppText style={styles.summaryLine} numberOfLines={2}>
            {t('records.daySummary.present')}: {summary.present} ·{' '}
            {t('records.daySummary.late')}: {summary.late} ·{' '}
            {t('records.daySummary.absent')}: {summary.absent} ·{' '}
            {t('records.daySummary.onLeave')}: {summary.onLeave}
          </AppText>
        ) : (
          <AppText style={styles.muted}>{t('records.daySummary.loading')}</AppText>
        )}
      </View>
      <Ionicons
        name={expanded ? 'chevron-up' : 'chevron-down'}
        size={20}
        color="#64748b"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  titleBlock: { flex: 1, marginEnd: 8 },
  date: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  summaryLine: { fontSize: 11, color: '#64748b', marginTop: 4 },
  muted: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
});
