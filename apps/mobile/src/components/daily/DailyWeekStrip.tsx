import { useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  isWeekendOffDay,
  parseDateKeyMonthIndex,
  shiftWeek,
  weekDayKeys,
  weekStartMonday,
} from '../../attendance/dailyWeek';
import { todayDateKey } from '../../attendance/formatters';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { monthYearLabel } from '../../i18n/calendarMonths';
import { CalendarDatePickerModal } from '../CalendarDatePicker';
import { dateStepChevron } from '../../ui/chevronIcons';
import { ltrText } from '../../ui/ltr';
import { mirroredRow } from '../../ui/rtlLayout';

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

function weekdayKeyForDate(dateKey: string): (typeof WEEKDAY_KEYS)[number] {
  const parts = dateKey.split('-').map((p) => parseInt(p, 10));
  if (parts.length !== 3) return 'mon';
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  const js = d.getDay();
  const idx = js === 0 ? 6 : js - 1;
  return WEEKDAY_KEYS[idx] ?? 'mon';
}

type Props = {
  value: string;
  onChange: (dateKey: string) => void;
};

export function DailyWeekStrip({ value, onChange }: Props) {
  const { t } = useTranslation('attendance');
  const { locale, mirrorLayout, isRtl, typography } = useI18n();
  const { isDark, palette } = useHomeTheme();
  const rtl = isRtl || mirrorLayout;
  const styles = useMemo(
    () => createStyles(isDark, typography, palette.teal),
    [isDark, typography, palette.teal],
  );
  const [calendarOpen, setCalendarOpen] = useState(false);

  const weekStart = weekStartMonday(value);
  const days = weekDayKeys(weekStart);
  const today = todayDateKey();
  const monthMeta = parseDateKeyMonthIndex(value);
  const monthLabel =
    monthMeta !== null
      ? monthYearLabel(locale, monthMeta.y, monthMeta.m)
      : value;

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 16 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderRelease: (_, g) => {
        if (g.dx < -36) onChange(shiftWeek(value, 1));
        else if (g.dx > 36) onChange(shiftWeek(value, -1));
      },
    }),
  ).current;

  return (
    <View style={styles.wrap}>
      <View style={[styles.monthRow, mirroredRow(mirrorLayout)]}>
        <Pressable
          onPress={() => onChange(shiftWeek(value, -1))}
          style={styles.navBtn}
          accessibilityLabel={t('calendar.prevMonth')}
        >
          <Ionicons name={dateStepChevron('prev', rtl)} size={20} color={styles.navIcon.color} />
        </Pressable>
        <Pressable onPress={() => setCalendarOpen(true)} style={styles.monthBtn}>
          <Text style={styles.monthText}>{monthLabel}</Text>
        </Pressable>
        <Pressable
          onPress={() => onChange(shiftWeek(value, 1))}
          style={styles.navBtn}
          accessibilityLabel={t('calendar.nextMonth')}
        >
          <Ionicons name={dateStepChevron('next', rtl)} size={20} color={styles.navIcon.color} />
        </Pressable>
      </View>

      <View {...pan.panHandlers}>
        <View style={[styles.strip, mirroredRow(mirrorLayout)]}>
          {days.map((dateKey) => {
            const selected = dateKey === value;
            const isToday = dateKey === today;
            const off = isWeekendOffDay(dateKey);
            const dayNum = parseInt(dateKey.split('-')[2] ?? '0', 10);
            const weekdayKey = weekdayKeyForDate(dateKey);

            return (
              <Pressable
                key={dateKey}
                onPress={() => onChange(dateKey)}
                style={[
                  styles.pill,
                  selected && styles.pillSelected,
                  off && !selected && styles.pillOff,
                ]}
                accessibilityState={{ selected }}
              >
                <Text
                  style={[
                    styles.weekday,
                    selected && styles.weekdaySelected,
                    off && !selected && styles.textOff,
                  ]}
                >
                  {t(`calendar.weekdays.${weekdayKey}`)}
                </Text>
                <Text
                  style={[
                    styles.dayNum,
                    ltrText,
                    selected && styles.dayNumSelected,
                    off && !selected && styles.textOff,
                  ]}
                >
                  {dayNum}
                </Text>
                {isToday ? (
                  <View
                    style={[
                      styles.todayDot,
                      selected && styles.todayDotSelected,
                    ]}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
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

function createStyles(isDark: boolean, typography: AppTypography, teal: string) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const muted = isDark ? '#64748B' : '#94A3B8';
  const offMuted = isDark ? '#475569' : '#CBD5E1';
  const track = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15, 23, 42, 0.05)';

  return StyleSheet.create({
    wrap: { gap: 10 },
    monthRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    navBtn: { padding: 6 },
    navIcon: { color: isDark ? '#94A3B8' : '#64748B' },
    monthBtn: { flex: 1, alignItems: 'center', paddingVertical: 4 },
    monthText: {
      fontFamily: typography.noto.bold,
      fontSize: 16,
      lineHeight: 22,
      color: text,
      textAlign: 'center',
    },
    strip: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 4,
    },
    pill: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 2,
      borderRadius: 14,
      backgroundColor: track,
      minHeight: 58,
      justifyContent: 'center',
      gap: 2,
    },
    pillSelected: {
      backgroundColor: teal,
    },
    pillOff: {
      opacity: 0.72,
    },
    weekday: {
      fontFamily: typography.noto.medium,
      fontSize: 11,
      lineHeight: 14,
      color: muted,
    },
    weekdaySelected: { color: 'rgba(255,255,255,0.92)' },
    dayNum: {
      fontFamily: typography.inter.bold,
      fontSize: 18,
      lineHeight: 22,
      color: text,
      fontVariant: ['tabular-nums'],
    },
    dayNumSelected: { color: '#FFFFFF' },
    textOff: { color: offMuted },
    todayDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: teal,
      marginTop: 2,
    },
    todayDotSelected: { backgroundColor: '#FFFFFF' },
  });
}
