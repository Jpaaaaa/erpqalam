import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { WeekBar } from '../../hooks/useHomeDashboard';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { AppText } from '../../ui/AppText';
import { ltrText } from '../../ui/ltr';
import { useI18n } from '../../i18n/I18nProvider';
import { mirroredRow } from '../../ui/rtlLayout';

export function WeeklyActivityChart({
  bars,
  weeklyAvgPct,
  weekdayKey,
}: {
  bars: WeekBar[];
  weeklyAvgPct: number;
  weekdayKey: (dateKey: string) => 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
}) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout } = useI18n();
  const { palette } = useHomeTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const maxH = 72;

  return (
    <View style={styles.card}>
      <View style={[styles.header, mirroredRow(mirrorLayout)]}>
        <AppText style={styles.title}>{t('home.thisWeek')}</AppText>
        <AppText style={[styles.avg, ltrText]}>{weeklyAvgPct}%</AppText>
      </View>
      <View style={[styles.barsRow, mirroredRow(mirrorLayout)]}>
        {bars.map((bar) => {
          const h = Math.max(4, (bar.rate / 100) * maxH);
          return (
            <View key={bar.dateKey} style={styles.barCol}>
              <View style={[styles.barTrack, { height: maxH }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: h,
                      backgroundColor: bar.isToday ? palette.teal : palette.ringTrack,
                    },
                  ]}
                />
              </View>
              <AppText style={styles.dayLabel}>
                {t(`calendar.weekdays.${weekdayKey(bar.dateKey)}`)}
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(p: ReturnType<typeof useHomeTheme>['palette']) {
  return StyleSheet.create({
    card: {
      backgroundColor: p.card,
      borderRadius: p.radiusCard,
      padding: 16,
      borderWidth: 1,
      borderColor: p.border,
      ...(p.cardShadow ?? {}),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: { fontSize: 16, fontWeight: '700', color: p.text },
    avg: { fontSize: 14, fontWeight: '700', color: p.teal },
    barsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    barCol: { flex: 1, alignItems: 'center', gap: 8 },
    barTrack: {
      width: 14,
      justifyContent: 'flex-end',
      borderRadius: 7,
      overflow: 'hidden',
      backgroundColor: p.cardElevated,
    },
    barFill: { width: '100%', borderRadius: 7 },
    dayLabel: { fontSize: 10, color: p.textMuted, fontWeight: '600' },
  });
}
