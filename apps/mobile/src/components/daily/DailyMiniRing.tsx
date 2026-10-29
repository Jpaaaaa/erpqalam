import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useI18n } from '../../i18n/I18nProvider';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { ltrText } from '../../ui/ltr';

const SIZE = 90;
const STROKE = 9;
const R = SIZE / 2 - STROKE / 2;
const TRACK = 'rgba(20, 184, 166, 0.12)';
const STROKE_COLOR = '#14B8A6';

export function DailyMiniRing({ pct }: { pct: number }) {
  const { typography } = useI18n();
  const { isDark } = useHomeTheme();
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  const dashOffset = useRingDashOffset(R, clamped);

  return (
    <View style={styles.wrap}>
      <Svg width={SIZE} height={SIZE}>
        <Circle cx={cx} cy={cy} r={R} stroke={TRACK} strokeWidth={STROKE} fill="none" />
        {clamped > 0 ? (
          <Circle
            cx={cx}
            cy={cy}
            r={R}
            stroke={STROKE_COLOR}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * R} ${2 * Math.PI * R}`}
            strokeDashoffset={dashOffset}
            rotation={-90}
            origin={`${cx}, ${cy}`}
          />
        ) : null}
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text
          style={[
            styles.pct,
            ltrText,
            {
              fontFamily: typography.inter.extraBold,
              color: isDark ? '#F1F5F9' : '#0F172A',
            },
          ]}
        >
          {clamped}%
        </Text>
      </View>
    </View>
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
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(listener);
  }, [anim, circ, targetPct]);

  return dashOffset;
}

const styles = StyleSheet.create({
  wrap: { width: SIZE, height: SIZE },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pct: { fontSize: 18, fontVariant: ['tabular-nums'] },
});
