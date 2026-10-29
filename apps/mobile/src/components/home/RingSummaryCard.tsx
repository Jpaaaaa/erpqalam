import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTranslation } from 'react-i18next';
import type { DailyAttendanceSummary } from '../../types/attendance';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { mirroredRow } from '../../ui/rtlLayout';
import { ltrText } from '../../ui/ltr';
import { HomeGlassCard } from './HomeGlassCard';
import { GLASS_INNER_CONTENT, GLASS_MUTED_DARK, GLASS_MUTED_LIGHT } from './homeGlass';

const RING_SIZE = 190;
const STROKE = 14;
const RING_GAP = 4;
const PCT_ZERO_COLOR = '#94A3B8';

const OUTER_R = RING_SIZE / 2 - STROKE / 2;
const MID_R = OUTER_R - STROKE - RING_GAP;
const INNER_R = MID_R - STROKE - RING_GAP;

const RING_COLORS = {
  attendance: '#14B8A6',
  punctuality: '#3B82F6',
  weekly: '#8B5CF6',
} as const;

const RING_TRACK = {
  attendance: 'rgba(20, 184, 166, 0.12)',
  punctuality: 'rgba(59, 130, 246, 0.12)',
  weekly: 'rgba(139, 92, 246, 0.12)',
} as const;

const ANIM_MS = 800;
const STAGGER_MS = 120;

const PILL_COLORS = {
  late: '#F59E0B',
  absent: '#EF4444',
  leave: '#8B5CF6',
} as const;

export function RingSummaryCard({
  summary,
  attendancePct,
  punctualityPct,
  weeklyAvgPct,
  onOpenDaily,
}: {
  summary: DailyAttendanceSummary;
  attendancePct: number;
  punctualityPct: number;
  weeklyAvgPct: number;
  onOpenDaily: () => void;
}) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout, typography } = useI18n();
  const { isDark } = useHomeTheme();
  const styles = useMemo(() => createStyles(isDark, typography), [isDark, typography]);

  const isEmpty = summary.employeeCount === 0;
  const displayAttPct = isEmpty ? null : Math.round(attendancePct);
  const attRounded = Math.round(attendancePct);
  const punctRounded = Math.round(punctualityPct);
  const weekRounded = Math.round(weeklyAvgPct);

  const legend = [
    {
      key: 'attendance',
      color: RING_COLORS.attendance,
      label: t('home.attendance'),
      pct: attRounded,
    },
    {
      key: 'punctuality',
      color: RING_COLORS.punctuality,
      label: t('home.punctuality'),
      pct: punctRounded,
    },
    {
      key: 'weekly',
      color: RING_COLORS.weekly,
      label: t('home.weeklyAverage'),
      pct: weekRounded,
    },
  ] as const;

  return (
    <HomeGlassCard padding={20}>
      <View style={[styles.cardInner, GLASS_INNER_CONTENT]}>
      <View style={[styles.topRow, mirroredRow(mirrorLayout), GLASS_INNER_CONTENT]}>
        <Text style={styles.title}>{t('home.heroTitle')}</Text>
        <LiveBadge label={t('home.live')} styles={styles} />
      </View>

      <View style={[styles.ringBlock, GLASS_INNER_CONTENT]}>
        <FitnessTripleRings
          attendancePct={isEmpty ? 0 : attendancePct}
          punctualityPct={isEmpty ? 0 : punctualityPct}
          weeklyAvgPct={isEmpty ? 0 : weeklyAvgPct}
          animate={!isEmpty}
        />
        <View style={styles.ringCenter} pointerEvents="none">
          {isEmpty ? (
            <>
              <Text style={styles.heroEmptyDash}>—</Text>
              <Text style={styles.emptyCaption}>{t('home.emptyNoEmployees')}</Text>
            </>
          ) : (
            <>
              <Text
                style={[
                  styles.heroPct,
                  displayAttPct === 0 ? styles.heroPctZero : null,
                ]}
              >
                {displayAttPct}%
              </Text>
              <HeroRatio present={summary.present} total={summary.employeeCount} styles={styles} />
            </>
          )}
        </View>
      </View>

      {!isEmpty ? (
        <View style={[styles.legendRow, GLASS_INNER_CONTENT]}>
          {legend.map((item) => (
            <View key={item.key} style={styles.legendItem}>
              <View style={styles.legendLine}>
                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                <Text style={styles.legendLabel} numberOfLines={1}>
                  {item.label}
                </Text>
                <Text style={[styles.legendPct, { color: item.color }]}>
                  {item.pct}%
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {!isEmpty ? (
        <Pressable
          style={({ pressed }) => [styles.statsLine, pressed && styles.statsLinePressed]}
          onPress={onOpenDaily}
          accessibilityRole="button"
        >
          <Text style={styles.statsLineText}>
            <Text style={[styles.statsNum, { color: PILL_COLORS.late }]}>{summary.late}</Text>
            <Text style={styles.statsLabel}> {t('home.pillLate')} · </Text>
            <Text style={[styles.statsNum, { color: PILL_COLORS.absent }]}>{summary.absent}</Text>
            <Text style={styles.statsLabel}> {t('home.pillAbsent')} · </Text>
            <Text style={[styles.statsNum, { color: PILL_COLORS.leave }]}>{summary.onLeave}</Text>
            <Text style={styles.statsLabel}> {t('home.pillOnLeave')}</Text>
          </Text>
        </Pressable>
      ) : null}
      </View>
    </HomeGlassCard>
  );
}

function HeroRatio({
  present,
  total,
  styles,
}: {
  present: number;
  total: number;
  styles: ReturnType<typeof createStyles>;
}) {
  const isolated = `\u2066${present} / ${total}\u2069`;
  return <Text style={styles.heroRatio}>{isolated}</Text>;
}

function LiveBadge({
  label,
  styles,
}: {
  label: string;
  styles: ReturnType<typeof createStyles>;
}) {
  const pulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <View style={styles.liveBadge}>
      <Animated.View style={[styles.liveDot, { opacity: pulse }]} />
      <Text style={styles.liveLabel}>{label}</Text>
    </View>
  );
}

function FitnessTripleRings({
  attendancePct,
  punctualityPct,
  weeklyAvgPct,
  animate,
}: {
  attendancePct: number;
  punctualityPct: number;
  weeklyAvgPct: number;
  animate: boolean;
}) {
  const cx = RING_SIZE / 2;
  const cy = RING_SIZE / 2;

  const outerOffset = useRingDashOffset(OUTER_R, attendancePct, animate, 0);
  const midOffset = useRingDashOffset(MID_R, punctualityPct, animate, STAGGER_MS);
  const innerOffset = useRingDashOffset(INNER_R, weeklyAvgPct, animate, STAGGER_MS * 2);

  const outerCirc = 2 * Math.PI * OUTER_R;
  const midCirc = 2 * Math.PI * MID_R;
  const innerCirc = 2 * Math.PI * INNER_R;

  return (
    <Svg width={RING_SIZE} height={RING_SIZE} style={StyleSheet.absoluteFill}>
      <RingLane
        cx={cx}
        cy={cy}
        r={OUTER_R}
        circ={outerCirc}
        track={RING_TRACK.attendance}
        stroke={RING_COLORS.attendance}
        dashOffset={outerOffset}
        pct={attendancePct}
      />
      <RingLane
        cx={cx}
        cy={cy}
        r={MID_R}
        circ={midCirc}
        track={RING_TRACK.punctuality}
        stroke={RING_COLORS.punctuality}
        dashOffset={midOffset}
        pct={punctualityPct}
      />
      <RingLane
        cx={cx}
        cy={cy}
        r={INNER_R}
        circ={innerCirc}
        track={RING_TRACK.weekly}
        stroke={RING_COLORS.weekly}
        dashOffset={innerOffset}
        pct={weeklyAvgPct}
      />
    </Svg>
  );
}

function RingLane({
  cx,
  cy,
  r,
  circ,
  track,
  stroke,
  dashOffset,
  pct,
}: {
  cx: number;
  cy: number;
  r: number;
  circ: number;
  track: string;
  stroke: string;
  dashOffset: number;
  pct: number;
}) {
  return (
    <>
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={track}
        strokeWidth={STROKE}
        fill="none"
      />
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

function useRingDashOffset(
  radius: number,
  targetPct: number,
  animate: boolean,
  delayMs: number,
) {
  const circ = 2 * Math.PI * radius;
  const anim = useRef(new Animated.Value(0)).current;
  const [dashOffset, setDashOffset] = useState(circ);

  useEffect(() => {
    anim.setValue(0);
    if (!animate || targetPct <= 0) {
      setDashOffset(circ);
      return;
    }
    const listener = anim.addListener(({ value }) => {
      const pct = Math.min(100, Math.max(0, value));
      setDashOffset(circ * (1 - pct / 100));
    });
    Animated.sequence([
      Animated.delay(delayMs),
      Animated.timing(anim, {
        toValue: targetPct,
        duration: ANIM_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
    return () => anim.removeListener(listener);
  }, [anim, animate, circ, delayMs, targetPct]);

  return dashOffset;
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const muted = isDark ? GLASS_MUTED_DARK : GLASS_MUTED_LIGHT;
  const text = isDark ? '#F1F5F9' : '#0F172A';

  const interNums = (extra: TextStyle): TextStyle => ({
    fontFamily: typography.inter.extraBold,
    writingDirection: 'ltr',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    ...extra,
  });

  return StyleSheet.create({
    cardInner: {
      backgroundColor: 'transparent',
    },
    topRow: {
      backgroundColor: 'transparent',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    title: {
      flex: 1,
      fontFamily: typography.noto.bold,
      fontSize: 15,
      lineHeight: 23,
      fontWeight: 'normal',
      color: text,
    },
    liveBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: isDark ? 'rgba(45, 212, 191, 0.12)' : 'rgba(20, 184, 166, 0.1)',
    },
    liveDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: '#14B8A6',
    },
    liveLabel: {
      fontFamily: typography.noto.bold,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: 'normal',
      color: '#14B8A6',
    },
    ringBlock: {
      alignSelf: 'center',
      width: RING_SIZE,
      height: RING_SIZE,
      marginBottom: 20,
      position: 'relative',
      backgroundColor: 'transparent',
    },
    ringCenter: {
      ...StyleSheet.absoluteFill,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
      backgroundColor: 'transparent',
    },
    heroPct: interNums({
      fontSize: 34,
      lineHeight: 43,
      letterSpacing: -1,
      color: text,
    }),
    heroPctZero: {
      color: PCT_ZERO_COLOR,
    },
    heroRatio: {
      fontFamily: typography.inter.semibold,
      fontSize: 15,
      lineHeight: 19,
      fontWeight: 'normal',
      color: muted,
      marginTop: 2,
      fontVariant: ['tabular-nums'],
      ...ltrText,
      textAlign: 'center',
    },
    heroEmptyDash: interNums({
      fontSize: 34,
      lineHeight: 43,
      color: muted,
    }),
    emptyCaption: {
      fontFamily: typography.noto.medium,
      fontSize: 13,
      lineHeight: 20,
      fontWeight: 'normal',
      color: muted,
      textAlign: 'center',
      marginTop: 6,
    },
    legendRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
      backgroundColor: 'transparent',
    },
    legendItem: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    legendLine: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      maxWidth: '100%',
      backgroundColor: 'transparent',
    },
    legendDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    legendLabel: {
      fontFamily: typography.noto.medium,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: 'normal',
      color: muted,
      flexShrink: 1,
    },
    legendPct: {
      fontFamily: typography.inter.bold,
      fontSize: 13,
      lineHeight: 16,
      fontWeight: 'normal',
      fontVariant: ['tabular-nums'],
      ...ltrText,
    },
    statsLine: {
      alignSelf: 'center',
      paddingVertical: 8,
      paddingHorizontal: 4,
      backgroundColor: 'transparent',
    },
    statsLinePressed: { opacity: 0.75 },
    statsLineText: {
      textAlign: 'center',
    },
    statsNum: {
      fontFamily: typography.inter.bold,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: 'normal',
      fontVariant: ['tabular-nums'],
      ...ltrText,
    },
    statsLabel: {
      fontFamily: typography.noto.medium,
      fontSize: 13,
      lineHeight: 20,
      fontWeight: 'normal',
      color: muted,
    },
  });
}
