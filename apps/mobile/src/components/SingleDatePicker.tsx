import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { formatDisplayDate, shiftDateKey } from '../attendance/formatters';
import { CalendarDatePickerModal } from './CalendarDatePicker';
import { useI18n } from '../i18n/I18nProvider';
import { AppText } from '../ui/AppText';
import { ltrText } from '../ui/ltr';
import { dateStepChevron } from '../ui/chevronIcons';
import { mirroredRow } from '../ui/rtlLayout';

export function SingleDatePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (dateKey: string) => void;
}) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout, isRtl } = useI18n();
  const rtl = isRtl || mirrorLayout;
  const [calendarOpen, setCalendarOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      <AppText style={styles.label}>{label}</AppText>
      <View style={[styles.row, mirroredRow(mirrorLayout)]}>
        <Pressable
          accessibilityLabel={t('daily.prevDay')}
          onPress={() => onChange(shiftDateKey(value, -1))}
          style={styles.iconBtn}
        >
          <Ionicons name={dateStepChevron('prev', rtl)} size={22} color="#0f766e" />
        </Pressable>
        <Pressable
          style={styles.center}
          onPress={() => setCalendarOpen(true)}
          accessibilityLabel={t('calendar.pickDate')}
        >
          <AppText style={[styles.display, ltrText]}>{formatDisplayDate(value)}</AppText>
          <Ionicons name="calendar-outline" size={18} color="#64748b" />
        </Pressable>
        <Pressable
          accessibilityLabel={t('daily.nextDay')}
          onPress={() => onChange(shiftDateKey(value, 1))}
          style={styles.iconBtn}
        >
          <Ionicons name={dateStepChevron('next', rtl)} size={22} color="#0f766e" />
        </Pressable>
      </View>
      <CalendarDatePickerModal
        visible={calendarOpen}
        value={value}
        onChange={onChange}
        onClose={() => setCalendarOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  row: { alignItems: 'center', gap: 8 },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0fdfa',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  display: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
});
