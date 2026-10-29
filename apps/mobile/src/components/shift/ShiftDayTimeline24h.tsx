import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ShiftScheduleForm } from '../../attendance/scheduleModel';
import { parseWallClockMinutes } from '../../attendance/wallClockTime';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { ltrText } from '../../ui/ltr';

const DAY_MINUTES = 24 * 60;
const TICK_HOURS = [0, 6, 12, 18, 24] as const;

type Segment = { leftPct: number; widthPct: number; color: string };

function seg(
  start: number,
  end: number,
  color: string,
): Segment | null {
  if (end <= start) return null;
  return {
    leftPct: (start / DAY_MINUTES) * 100,
    widthPct: ((end - start) / DAY_MINUTES) * 100,
    color,
  };
}

export function ShiftDayTimeline24h({ schedule }: { schedule: ShiftScheduleForm }) {
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
    const out: Segment[] = [];
    const push = (a: number | null, b: number | null, color: string) => {
      if (a == null || b == null) return;
      const s = seg(a, b, color);
      if (s) out.push(s);
    };
    push(m('entryZoneStart'), m('entryZoneEnd'), '#14B8A6');
    push(m('lateZoneStartTime'), m('lateZoneEndTime'), '#F59E0B');
    push(m('exitZoneStart'), m('exitZoneEnd'), '#3B82F6');
    push(m('earlyLeftZoneStartTime'), m('earlyLeftZoneEndTime'), '#EF4444');
    const ss = m('shiftStartTime');
    const se = m('shiftEndTime');
    if (ss != null && se != null && se > ss) {
      push(ss, se, 'rgba(148, 163, 184, 0.45)');
    }
    return out;
  }, [schedule]);

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        {segments.map((s, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                left: `${s.leftPct}%`,
                width: `${s.widthPct}%`,
                backgroundColor: s.color,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.ticks}>
        {TICK_HOURS.map((h) => (
          <View key={h} style={[styles.tickWrap, { left: `${(h / 24) * 100}%` }]}>
            <View style={styles.tickMark} />
            <Text style={[styles.tickLabel, ltrText]}>
              {h === 24 ? '24' : String(h).padStart(2, '0')}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  return StyleSheet.create({
    wrap: { gap: 6, marginTop: 12 },
    track: {
      height: 16,
      borderRadius: 8,
      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.85)' : 'rgba(226, 232, 240, 0.95)',
      overflow: 'hidden',
      position: 'relative',
    },
    bar: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      borderRadius: 4,
    },
    ticks: {
      height: 28,
      position: 'relative',
      marginHorizontal: 2,
    },
    tickWrap: {
      position: 'absolute',
      alignItems: 'center',
      transform: [{ translateX: -8 }],
      width: 16,
    },
    tickMark: {
      width: 1,
      height: 6,
      backgroundColor: isDark ? '#64748B' : '#94A3B8',
      marginBottom: 2,
    },
    tickLabel: {
      fontFamily: typography.inter.semibold,
      fontSize: 9,
      color: isDark ? '#94A3B8' : '#64748B',
      fontVariant: ['tabular-nums'],
    },
  });
}
