import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { ShiftScheduleForm } from '../../attendance/scheduleModel';
import { formatWallClockTime12h } from '../../attendance/wallClockTime';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { HomeGlassCard } from '../home/HomeGlassCard';
import { ltrText } from '../../ui/ltr';
import { ShiftDayTimeline24h } from './ShiftDayTimeline24h';

export function ShiftHeroCard({ schedule }: { schedule: ShiftScheduleForm }) {
  const { t } = useTranslation('attendance');
  const { typography } = useI18n();
  const { isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  const am = t('settings.timeAm');
  const pm = t('settings.timePm');
  const range = `${formatWallClockTime12h(schedule.shiftStartTime, am, pm)} → ${formatWallClockTime12h(schedule.shiftEndTime, am, pm)}`;

  return (
    <HomeGlassCard>
      <Text style={[styles.range, ltrText]}>{range}</Text>
      <ShiftDayTimeline24h schedule={schedule} />
    </HomeGlassCard>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  return StyleSheet.create({
    range: {
      fontFamily: typography.inter.extraBold,
      fontSize: 28,
      lineHeight: 34,
      color: isDark ? '#F1F5F9' : '#0F172A',
      marginBottom: 16,
    },
  });
}
