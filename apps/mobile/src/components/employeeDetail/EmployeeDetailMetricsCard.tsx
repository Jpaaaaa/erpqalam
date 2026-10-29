import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { ltrText } from '../../ui/ltr';
import { HomeGlassCard } from '../home/HomeGlassCard';
import { GLASS_INNER_CONTENT, GLASS_MUTED_DARK, GLASS_MUTED_LIGHT } from '../home/homeGlass';
import { MiniTripleRings } from './MiniTripleRings';

export type EmployeeDetailMetrics = {
  present: number;
  expected: number;
  late: number;
  early: number;
  absent: number;
  avgEntry: string | null;
  leaveRemaining: number;
  tempLeaveCount: number;
  attendancePct: number;
  punctualityPct: number;
  leaveUsedPct: number;
  lateMinutes: number;
  trendAttendancePct: number | null;
  trendLatePct: number | null;
};

function TrendChip({
  label,
  delta,
  betterWhenDown,
  styles,
}: {
  label: string;
  delta: number | null;
  betterWhenDown?: boolean;
  styles: ReturnType<typeof createStyles>;
}) {
  if (delta == null) return null;
  const flat = delta === 0;
  const improved = betterWhenDown ? delta < 0 : delta > 0;
  const color = flat ? styles.trendNeutral : improved ? styles.trendGood : styles.trendBad;
  const arrow = flat ? '—' : delta > 0 ? '▲' : '▼';
  const pct = Math.abs(delta);

  return (
    <View style={styles.trendRow}>
      <Text style={styles.trendLabel}>{label}</Text>
      <Text style={[styles.trendValue, color]}>
        {arrow} {pct}%
      </Text>
    </View>
  );
}

export function EmployeeDetailMetricsCard({ metrics }: { metrics: EmployeeDetailMetrics }) {
  const { t } = useTranslation('attendance');
  const { typography } = useI18n();
  const { isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  const tiles = [
    {
      key: 'present',
      value: `${metrics.present} / ${metrics.expected}`,
      label: t('employeeDetail.kpi.presentDays'),
    },
    {
      key: 'late',
      value: `${metrics.late} · ${metrics.lateMinutes}m`,
      label: t('employeeDetail.kpi.late'),
    },
    {
      key: 'early',
      value: String(metrics.early),
      label: t('employeeDetail.kpi.earlyExit'),
    },
    {
      key: 'absent',
      value: String(metrics.absent),
      label: t('employeeDetail.kpi.absent'),
    },
    {
      key: 'avg',
      value: metrics.avgEntry ?? '—',
      label: t('employeeDetail.kpi.avgEntry'),
    },
    {
      key: 'leave',
      value: `${metrics.leaveRemaining} (+${metrics.tempLeaveCount})`,
      label: t('employeeDetail.kpi.leaveBalance'),
    },
  ];

  return (
    <HomeGlassCard padding={16}>
      <View style={[GLASS_INNER_CONTENT, styles.wrap]}>
        <MiniTripleRings
          attendancePct={metrics.attendancePct}
          punctualityPct={metrics.punctualityPct}
          leavePct={metrics.leaveUsedPct}
          centerLabel={`${metrics.attendancePct}%`}
        />
        <View style={styles.trends}>
          <TrendChip
            label={t('employeeDetail.trend.attendance')}
            delta={metrics.trendAttendancePct}
            styles={styles}
          />
          <TrendChip
            label={t('employeeDetail.trend.late')}
            delta={metrics.trendLatePct}
            betterWhenDown
            styles={styles}
          />
        </View>
        <View style={styles.grid}>
          {tiles.map((tile) => (
            <View key={tile.key} style={styles.tile}>
              <Text style={styles.tileValue}>{tile.value}</Text>
              <Text style={styles.tileLabel} numberOfLines={2}>
                {tile.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </HomeGlassCard>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const muted = isDark ? GLASS_MUTED_DARK : GLASS_MUTED_LIGHT;
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const tileBg = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(15, 23, 42, 0.04)';

  return StyleSheet.create({
    wrap: { gap: 16 },
    trends: { gap: 6 },
    trendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    trendLabel: {
      fontFamily: typography.noto.medium,
      fontSize: 12,
      color: muted,
    },
    trendValue: {
      fontFamily: typography.inter.bold,
      fontSize: 12,
      fontVariant: ['tabular-nums'],
      ...ltrText,
    },
    trendGood: { color: '#16A34A' },
    trendBad: { color: '#DC2626' },
    trendNeutral: { color: muted },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    tile: {
      width: '48%',
      flexGrow: 1,
      minWidth: '46%',
      backgroundColor: tileBg,
      borderRadius: 16,
      padding: 12,
      gap: 4,
    },
    tileValue: {
      fontFamily: typography.inter.extraBold,
      fontSize: 20,
      lineHeight: 24,
      color: text,
      fontVariant: ['tabular-nums'],
      ...ltrText,
    },
    tileLabel: {
      fontFamily: typography.noto.medium,
      fontSize: 12,
      lineHeight: 18,
      color: muted,
    },
  });
}
