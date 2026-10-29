import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useI18n } from '../../i18n/I18nProvider';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { ltrText } from '../../ui/ltr';

const SIZE = 120;
const STROKE = 10;
const GAP = 3;
const OUTER_R = SIZE / 2 - STROKE / 2;
const MID_R = OUTER_R - STROKE - GAP;
const INNER_R = MID_R - STROKE - GAP;

const COLORS = {
  attendance: '#14B8A6',
  punctuality: '#3B82F6',
  leave: '#8B5CF6',
} as const;

const TRACK = {
  attendance: 'rgba(20, 184, 166, 0.12)',
  punctuality: 'rgba(59, 130, 246, 0.12)',
  leave: 'rgba(139, 92, 246, 0.12)',
} as const;

export function MiniTripleRings({
  attendancePct,
  punctualityPct,
  leavePct,
  centerLabel,
}: {
  attendancePct: number;
  punctualityPct: number;
  leavePct: number;
  centerLabel: string;
}) {
  const { typography } = useI18n();
  const { isDark } = useHomeTheme();
  const cx = SIZE / 2;
  const cy = SIZE / 2;

  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE}>
        <RingLane cx={cx} cy={cy} r={OUTER_R} track={TRACK.attendance} stroke={COLORS.attendance} pct={attendancePct} />
        <RingLane cx={cx} cy={cy} r={MID_R} track={TRACK.punctuality} stroke={COLORS.punctuality} pct={punctualityPct} />
        <RingLane cx={cx} cy={cy} r={INNER_R} track={TRACK.leave} stroke={COLORS.leave} pct={leavePct} />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text
          style={[
            styles.centerText,
            {
              fontFamily: typography.inter.extraBold,
              color: isDark ? '#F1F5F9' : '#0F172A',
            },
          ]}
        >
          {centerLabel}
        </Text>
      </View>
    </View>
  );
}

function RingLane({
  cx,
  cy,
  r,
  track,
  stroke,
  pct,
}: {
  cx: number;
  cy: number;
  r: number;
  track: string;
  stroke: string;
  pct: number;
}) {
  const circ = 2 * Math.PI * r;
  const dashOffset = useRingDashOffset(r, pct);

  return (
    <>
      <Circle cx={cx} cy={cy} r={r} stroke={track} strokeWidth={STROKE} fill="none" />
      {pct > 0 ? (
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={stroke}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`}
          strokeDashoffset={dashOffset}
          rotation={-90}
          origin={`${cx}, ${cy}`}
        />
      ) : null}
    </>
  );
}

function useRingDashOffset(radius: number, targetPct: number) {
  const circ = 2 * Math.PI * radius;
  const anim = useRef(new Animated.Value(0)).current;
  const [dashOffset, setDashOffset] = useState(circ);

  useEffect(() => {
    anim.setValue(0);
    if (targetPct <= 0) {
      setDashOffset(circ);
      return;
    }
    const listener = anim.addListener(({ value }) => {
      const pct = Math.min(100, Math.max(0, value));
      setDashOffset(circ * (1 - pct / 100));
    });
    Animated.timing(anim, {
      toValue: targetPct,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(listener);
  }, [anim, circ, targetPct]);

  return dashOffset;
}

const styles = StyleSheet.create({
  wrap: {
    width: SIZE,
    height: SIZE,
    alignSelf: 'center',
  },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    fontSize: 22,
    lineHeight: 28,
    fontVariant: ['tabular-nums'],
    ...ltrText,
  },
});
