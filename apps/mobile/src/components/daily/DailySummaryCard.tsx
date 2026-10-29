import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { DailyAttendanceSummary } from '../../types/attendance';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { HomeGlassCard } from '../home/HomeGlassCard';
import { GLASS_INNER_CONTENT } from '../home/homeGlass';
import { DailyMiniRing } from './DailyMiniRing';
import { ltrText } from '../../ui/ltr';
import { mirroredRow } from '../../ui/rtlLayout';

export function DailySummaryCard({
  summary,
  showOffDayBanner,
}: {
  summary: DailyAttendanceSummary;
  showOffDayBanner: boolean;
}) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout, typography } = useI18n();
  const { isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  const attendancePct =
    summary.employeeCount > 0
      ? Math.round((summary.present / summary.employeeCount) * 100)
      : 0;

  if (showOffDayBanner) {
    return (
      <HomeGlassCard padding={16}>
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{t('daily.offDayBanner')}</Text>
        </View>
      </HomeGlassCard>
    );
  }

  return (
    <HomeGlassCard padding={16}>
      <View style={[styles.row, mirroredRow(mirrorLayout), GLASS_INNER_CONTENT]}>
        <DailyMiniRing pct={attendancePct} />
        <View style={styles.stats}>
          <Stat
            label={t('daily.summary.present')}
            value={summary.present}
            color="#14B8A6"
            styles={styles}
          />
          <Stat
            label={t('daily.summary.late')}
            value={summary.late}
            color="#D97706"
            styles={styles}
          />
          <Stat
            label={t('daily.summary.absent')}
            value={summary.absent}
            color="#EF4444"
            styles={styles}
          />
        </View>
      </View>
      <Text style={styles.footer} numberOfLines={2}>
        {t('daily.summaryFooter', {
          earlyExit: summary.earlyExit,
          onLeave: summary.onLeave,
          holiday: summary.officialHoliday,
        })}
      </Text>
    </HomeGlassCard>
  );
}

function Stat({
  label,
  value,
  color,
  styles,
}: {
  label: string;
  value: number;
  color: string;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, ltrText, { color }]}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const muted = isDark ? '#94A3B8' : '#64748B';
  const bannerBg = isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(148, 163, 184, 0.14)';

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    stats: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
    },
    stat: { flex: 1, alignItems: 'center', minWidth: 0 },
    statValue: {
      fontFamily: typography.inter.extraBold,
      fontSize: 20,
      lineHeight: 26,
      fontVariant: ['tabular-nums'],
    },
    statLabel: {
      fontFamily: typography.noto.medium,
      fontSize: 11,
      lineHeight: 15,
      color: muted,
      textAlign: 'center',
      marginTop: 2,
    },
    footer: {
      fontFamily: typography.noto.medium,
      fontSize: 12,
      lineHeight: 18,
      color: muted,
      marginTop: 14,
      textAlign: 'center',
    },
    banner: {
      paddingVertical: 18,
      paddingHorizontal: 12,
      borderRadius: 16,
      backgroundColor: bannerBg,
      alignItems: 'center',
    },
    bannerText: {
      fontFamily: typography.noto.bold,
      fontSize: 15,
      color: muted,
    },
  });
}
