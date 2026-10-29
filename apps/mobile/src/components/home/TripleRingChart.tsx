import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import type { HomePalette } from '../../theme/homeTheme';
import { AppText } from '../../ui/AppText';

function ringDash(r: number, pct: number) {
  const circ = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, pct / 100));
  return `${circ * clamped} ${circ}`;
}

export function TripleRingChart({
  centerLabel,
  attendancePct,
  punctualityPct,
  weeklyAvgPct,
  palette,
}: {
  centerLabel: string;
  attendancePct: number;
  punctualityPct: number;
  weeklyAvgPct: number;
  palette: HomePalette;
}) {
  const size = 120;
  const c = size / 2;
  const outerR = 52;
  const midR = 42;
  const innerR = 32;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={c}
          cy={c}
          r={outerR}
          stroke={palette.ringTrack}
          strokeWidth={8}
          fill="none"
        />
        <Circle
          cx={c}
          cy={c}
          r={outerR}
          stroke={palette.purple}
          strokeWidth={8}
          fill="none"
          strokeDasharray={ringDash(outerR, weeklyAvgPct)}
          strokeLinecap="round"
          rotation={-90}
          origin={`${c}, ${c}`}
        />
        <Circle
          cx={c}
          cy={c}
          r={midR}
          stroke={palette.ringTrack}
          strokeWidth={8}
          fill="none"
        />
        <Circle
          cx={c}
          cy={c}
          r={midR}
          stroke={palette.blue}
          strokeWidth={8}
          fill="none"
          strokeDasharray={ringDash(midR, punctualityPct)}
          strokeLinecap="round"
          rotation={-90}
          origin={`${c}, ${c}`}
        />
        <Circle
          cx={c}
          cy={c}
          r={innerR}
          stroke={palette.ringTrack}
          strokeWidth={8}
          fill="none"
        />
        <Circle
          cx={c}
          cy={c}
          r={innerR}
          stroke={palette.teal}
          strokeWidth={8}
          fill="none"
          strokeDasharray={ringDash(innerR, attendancePct)}
          strokeLinecap="round"
          rotation={-90}
          origin={`${c}, ${c}`}
        />
      </Svg>
      <View style={styles.labelWrap}>
        <AppText style={[styles.centerText, { color: palette.text }]}>
          {centerLabel}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  labelWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  centerText: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
});
