import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ShiftScheduleForm } from '../../attendance/scheduleModel';
import { parseWallClockMinutes } from '../../attendance/wallClockTime';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';

type Segment = { left: number; width: number; color: string; label: string };

function segment(
  start: number,
  end: number,
  rangeStart: number,
  rangeSpan: number,
  color: string,
  label: string,
): Segment | null {
  if (end <= start || rangeSpan <= 0) return null;
  const left = ((start - rangeStart) / rangeSpan) * 100;
  const width = ((end - start) / rangeSpan) * 100;
  if (width <= 0) return null;
  return {
    left: Math.max(0, Math.min(100, left)),
    width: Math.max(0.5, Math.min(100 - left, width)),
    color,
    label,
  };
}

export function ShiftTimelineBar({ schedule }: { schedule: ShiftScheduleForm }) {
  const { t } = useTranslation('attendance');
  const { typography } = useI18n();
  const { isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  const segments = useMemo(() => {
    const m = (key: keyof ShiftScheduleForm) => {
      const v = schedule[key];
      if (typeof v !== 'string') return null;
      return parseWallClockMinutes(v);
    };
    const shiftStart = m('shiftStartTime');
    const shiftEnd = m('shiftEndTime');
    if (shiftStart == null || shiftEnd == null || shiftEnd <= shiftStart) {
      return [] as Segment[];
    }
    const pad = 30;
    const rangeStart = Math.min(
      shiftStart - pad,
      m('entryZoneStart') ?? shiftStart,
      m('earlyLeftZoneStartTime') ?? shiftEnd,
    );
    const rangeEnd = Math.max(
      shiftEnd + pad,
      m('exitZoneEnd') ?? shiftEnd,
    );
    const span = rangeEnd - rangeStart;
    const out: Segment[] = [];
    const push = (
      a: number | null,
      b: number | null,
      color: string,
      labelKey: string,
    ) => {
      if (a == null || b == null) return;
      const s = segment(a, b, rangeStart, span, color, t(labelKey));
      if (s) out.push(s);
    };
    push(m('entryZoneStart'), m('entryZoneEnd'), '#14B8A6', 'settings.timelineEntry');
    push(m('lateZoneStartTime'), m('lateZoneEndTime'), '#F59E0B', 'settings.timelineLate');
    push(
      m('earlyLeftZoneStartTime'),
      m('earlyLeftZoneEndTime'),
      '#6366F1',
      'settings.timelineEarly',
    );
    push(m('exitZoneStart'), m('exitZoneEnd'), '#3B82F6', 'settings.timelineExit');
    push(shiftStart, shiftEnd, 'rgba(148, 163, 184, 0.35)', 'settings.timelineShift');
    return out;
  }, [schedule, t]);

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        {segments.map((s, i) => (
          <View
            key={`${s.label}-${i}`}
            style={[
              styles.seg,
              {
                left: `${s.left}%`,
                width: `${s.width}%`,
                backgroundColor: s.color,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.legend}>
        {[
          ['#14B8A6', 'settings.timelineEntry'],
          ['#F59E0B', 'settings.timelineLate'],
          ['#6366F1', 'settings.timelineEarly'],
          ['#3B82F6', 'settings.timelineExit'],
        ].map(([color, key]) => (
          <View key={key} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: color as string }]} />
            <Text style={styles.legendText}>{t(key as string)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  return StyleSheet.create({
    wrap: { gap: 10, marginBottom: 8 },
    track: {
      height: 14,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(226, 232, 240, 0.9)',
      overflow: 'hidden',
      position: 'relative',
    },
    seg: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      borderRadius: 4,
    },
    legend: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    legendText: {
      fontFamily: typography.noto.medium,
      fontSize: 10,
      color: isDark ? '#94A3B8' : '#64748B',
    },
  });
}
