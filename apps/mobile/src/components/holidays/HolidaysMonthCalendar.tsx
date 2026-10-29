import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatLocalDateKey, todayDateKey } from '../../attendance/formatters';
import type { AttendanceHoliday, AttendanceHolidayType } from '../../types/attendance';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { monthYearLabel } from '../../i18n/calendarMonths';
import { HomeGlassCard } from '../home/HomeGlassCard';
import { holidayTypeColor } from './holidayColors';
import { dateStepChevron } from '../../ui/chevronIcons';
import { ltrText } from '../../ui/ltr';
import { mirroredRow } from '../../ui/rtlLayout';

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

function weekdayMondayFirst(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

type Props = {
  holidays: AttendanceHoliday[];
  selectedDate: string | null;
  onSelectDate: (dateKey: string, type: AttendanceHolidayType | null) => void;
};

export function HolidaysMonthCalendar({ holidays, selectedDate, onSelectDate }: Props) {
  const { t } = useTranslation('attendance');
  const { locale, mirrorLayout, isRtl, typography } = useI18n();
  const { isDark } = useHomeTheme();
  const rtl = isRtl || mirrorLayout;
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  const today = todayDateKey();
  const initial = selectedDate ?? today;
  const initialParts = initial.split('-').map((p) => parseInt(p, 10));
  const [viewYear, setViewYear] = useState(initialParts[0] ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState((initialParts[1] ?? 1) - 1);

  const byDate = useMemo(() => {
    const map = new Map<string, AttendanceHolidayType>();
    for (const h of holidays) {
      map.set(h.date, h.type);
    }
    return map;
  }, [holidays]);

  const cells = useMemo(() => {
    const total = daysInMonth(viewYear, viewMonth);
    const first = weekdayMondayFirst(new Date(viewYear, viewMonth, 1));
    const out: (number | null)[] = [];
    for (let i = 0; i < first; i += 1) out.push(null);
    for (let d = 1; d <= total; d += 1) out.push(d);
    while (out.length % 7 !== 0) out.push(null);
    return out;
  }, [viewYear, viewMonth]);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  }

  return (
    <HomeGlassCard padding={14}>
      <View style={[styles.monthNav, mirroredRow(mirrorLayout)]}>
        <Pressable onPress={prevMonth} style={styles.navBtn}>
          <Ionicons name={dateStepChevron('prev', rtl)} size={20} color={styles.navColor.color} />
        </Pressable>
        <Text style={styles.monthTitle}>{monthYearLabel(locale, viewYear, viewMonth)}</Text>
        <Pressable onPress={nextMonth} style={styles.navBtn}>
          <Ionicons name={dateStepChevron('next', rtl)} size={20} color={styles.navColor.color} />
        </Pressable>
      </View>
      <View style={[styles.weekRow, mirroredRow(mirrorLayout)]}>
        {WEEKDAY_KEYS.map((key) => (
          <Text key={key} style={styles.weekday}>
            {t(`calendar.weekdays.${key}`)}
          </Text>
        ))}
      </View>
      <View style={styles.cells}>
        {cells.map((day, index) => {
          if (day === null) {
            return <View key={`e-${index}`} style={styles.cell} />;
          }
          const key = formatLocalDateKey(new Date(viewYear, viewMonth, day));
          const type = byDate.get(key);
          const selected = selectedDate === key;
          const color = type ? holidayTypeColor(type) : undefined;
          return (
            <Pressable
              key={key}
              style={[
                styles.cell,
                type && { backgroundColor: `${color}22` },
                selected && styles.cellSelected,
              ]}
              onPress={() => onSelectDate(key, type ?? null)}
            >
              <Text style={[styles.dayNum, ltrText, selected && styles.dayNumSelected]}>
                {day}
              </Text>
              {type ? (
                <View style={[styles.dot, { backgroundColor: color }]} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </HomeGlassCard>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const muted = isDark ? '#94A3B8' : '#64748B';

  return StyleSheet.create({
    monthNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    navBtn: { padding: 6 },
    navColor: { color: muted },
    monthTitle: {
      fontFamily: typography.noto.bold,
      fontSize: 16,
      color: text,
    },
    weekRow: {
      flexDirection: 'row',
      marginBottom: 6,
    },
    weekday: {
      flex: 1,
      textAlign: 'center',
      fontFamily: typography.noto.medium,
      fontSize: 11,
      color: muted,
    },
    cells: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    cell: {
      width: `${100 / 7}%`,
      aspectRatio: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      padding: 2,
    },
    cellSelected: {
      borderWidth: 2,
      borderColor: '#14B8A6',
    },
    dayNum: {
      fontFamily: typography.inter.bold,
      fontSize: 14,
      color: text,
      fontVariant: ['tabular-nums'],
    },
    dayNumSelected: { color: '#0F766E' },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      marginTop: 2,
    },
  });
}
