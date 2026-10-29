import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  formatDisplayDate,
  formatLocalDateKey,
  isValidDateKey,
} from '../attendance/formatters';
import { useI18n } from '../i18n/I18nProvider';
import { monthYearLabel } from '../i18n/calendarMonths';
import { AppText } from '../ui/AppText';
import { ltrText } from '../ui/ltr';
import { dateStepChevron } from '../ui/chevronIcons';
import { mirroredRow } from '../ui/rtlLayout';

function parseDateKey(dateKey: string): { y: number; m: number; d: number } | null {
  if (!isValidDateKey(dateKey)) return null;
  const [y, m, d] = dateKey.split('-').map((p) => parseInt(p, 10));
  return { y, m: m - 1, d };
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** Monday = 0 … Sunday = 6 */
function weekdayMondayFirst(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

type CalendarGridProps = {
  viewYear: number;
  viewMonth: number;
  selectedKey: string;
  onSelect: (dateKey: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

function CalendarGrid({
  viewYear,
  viewMonth,
  selectedKey,
  onSelect,
  onPrevMonth,
  onNextMonth,
}: CalendarGridProps) {
  const { t } = useTranslation('attendance');
  const { locale, isRtl, mirrorLayout } = useI18n();
  const rtl = isRtl || mirrorLayout;

  const cells = useMemo(() => {
    const total = daysInMonth(viewYear, viewMonth);
    const first = weekdayMondayFirst(new Date(viewYear, viewMonth, 1));
    const out: (number | null)[] = [];
    for (let i = 0; i < first; i += 1) out.push(null);
    for (let d = 1; d <= total; d += 1) out.push(d);
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [viewYear, viewMonth]);

  return (
    <View style={styles.gridWrap}>
      <View style={[styles.monthNav, mirroredRow(mirrorLayout)]}>
        <Pressable onPress={onPrevMonth} style={styles.navBtn} accessibilityLabel={t('calendar.prevMonth')}>
          <Ionicons name={dateStepChevron('prev', rtl)} size={22} color="#0f766e" />
        </Pressable>
        <AppText style={[styles.monthTitle, ltrText]}>
          {monthYearLabel(locale, viewYear, viewMonth)}
        </AppText>
        <Pressable onPress={onNextMonth} style={styles.navBtn} accessibilityLabel={t('calendar.nextMonth')}>
          <Ionicons name={dateStepChevron('next', rtl)} size={22} color="#0f766e" />
        </Pressable>
      </View>
      <View style={[styles.weekRow, mirroredRow(mirrorLayout)]}>
        {WEEKDAY_KEYS.map((key) => (
          <AppText key={key} style={styles.weekday}>
            {t(`calendar.weekdays.${key}`)}
          </AppText>
        ))}
      </View>
      <View style={styles.cells}>
        {cells.map((day, index) => {
          if (day === null) {
            return <View key={`e-${index}`} style={styles.cell} />;
          }
          const key = formatLocalDateKey(new Date(viewYear, viewMonth, day));
          const selected = key === selectedKey;
          return (
            <Pressable
              key={key}
              style={[styles.cell, selected && styles.cellSelected]}
              onPress={() => onSelect(key)}
            >
              <AppText style={[styles.dayNum, ltrText, selected && styles.dayNumSelected]}>
                {day}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function CalendarDatePickerModal({
  visible,
  value,
  onChange,
  onClose,
}: {
  visible: boolean;
  value: string;
  onChange: (dateKey: string) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation('attendance');
  const parsed = parseDateKey(value) ?? parseDateKey(formatLocalDateKey(new Date()));
  const [viewYear, setViewYear] = useState(parsed?.y ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.m ?? new Date().getMonth());

  useEffect(() => {
    if (!visible) return;
    const p = parseDateKey(value) ?? parseDateKey(formatLocalDateKey(new Date()));
    if (p) {
      setViewYear(p.y);
      setViewMonth(p.m);
    }
  }, [visible, value]);

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <CalendarGrid
            viewYear={viewYear}
            viewMonth={viewMonth}
            selectedKey={value}
            onSelect={(key) => {
              onChange(key);
              onClose();
            }}
            onPrevMonth={() => shiftMonth(-1)}
            onNextMonth={() => shiftMonth(1)}
          />
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <AppText style={styles.closeText}>{t('records.cancel')}</AppText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function DateFieldPicker({
  label,
  value,
  onChange,
  optional,
}: {
  label: string;
  value: string;
  onChange: (dateKey: string) => void;
  optional?: boolean;
}) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout } = useI18n();
  const [open, setOpen] = useState(false);
  const display =
    value && isValidDateKey(value)
      ? formatDisplayDate(value)
      : optional
        ? t('holidays.dateToOptional')
        : t('calendar.pickDate');

  return (
    <>
      <AppText style={styles.fieldLabel}>{label}</AppText>
      <Pressable
        style={[styles.field, mirroredRow(mirrorLayout)]}
        onPress={() => setOpen(true)}
      >
        <AppText style={[styles.fieldText, ltrText, !value && styles.fieldPlaceholder]}>
          {display}
        </AppText>
        <Ionicons name="calendar-outline" size={20} color="#0f766e" />
      </Pressable>
      <CalendarDatePickerModal
        visible={open}
        value={value || formatLocalDateKey(new Date())}
        onChange={onChange}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: 28,
  },
  gridWrap: { gap: 8 },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  navBtn: { padding: 8 },
  monthTitle: { fontSize: 17, fontWeight: '600', color: '#0f172a' },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  cells: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: {
    backgroundColor: '#ccfbf1',
    borderRadius: 999,
  },
  dayNum: { fontSize: 15, color: '#0f172a' },
  dayNumSelected: { fontWeight: '700', color: '#0f766e' },
  closeBtn: { marginTop: 12, alignItems: 'center', padding: 8 },
  closeText: { color: '#64748b', fontWeight: '600' },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: '#64748b', marginTop: 8 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
    backgroundColor: '#fff',
  },
  fieldText: { fontSize: 16, color: '#0f172a', flex: 1 },
  fieldPlaceholder: { color: '#94a3b8' },
});
