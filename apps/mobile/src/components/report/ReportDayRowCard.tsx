import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { TFunction } from 'i18next';
import { formatDisplayDate, formatTime24 } from '../../attendance/formatters';
import { buildEmployeeDayRows } from '../../attendance/report-days';
import {
  earlyExitCoverId,
  isEarlyExitCovered,
  isLateArrivalCovered,
  lateArrivalCoverId,
} from '../../attendance/time-leave-cover';
import type { PunchType, TimeLeaveUsage } from '../../types/attendance';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { HomeGlassCard } from '../home/HomeGlassCard';
import { ltrText } from '../../ui/ltr';
import { mirroredRow } from '../../ui/rtlLayout';

type DayRow = ReturnType<typeof buildEmployeeDayRows>[number];

export function ReportDayRowCard({
  day,
  deviceUserId,
  canManage,
  canAdd,
  coverBusy,
  timeLeaveUsage,
  t,
  punchLabel,
  onCover,
  onRemove,
}: {
  day: DayRow;
  deviceUserId: string;
  canManage: boolean;
  canAdd: boolean;
  coverBusy: string | null;
  timeLeaveUsage: TimeLeaveUsage[];
  t: TFunction<'attendance'>;
  punchLabel: (type: PunchType | null | undefined) => string;
  onCover: (payload: {
    deviceUserId: string;
    date: string;
    timestamp: string;
    type: 'late_arrival' | 'early_exit';
  }) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const { mirrorLayout } = useI18n();
  const { isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark),
    [isDark],
  );

  const isLate = day.entryType === 'entry_late';
  const isEarly = day.exitType === 'early_exit';
  const entryCovered =
    isLate && day.entryTime
      ? isLateArrivalCovered(day.entryTime, timeLeaveUsage)
      : false;
  const exitCovered = isEarly
    ? isEarlyExitCovered(deviceUserId, day.date, timeLeaveUsage)
    : false;
  const entryCoverId =
    day.entryTime && isLate
      ? lateArrivalCoverId(day.entryTime, timeLeaveUsage)
      : null;
  const exitCoverId = isEarly
    ? earlyExitCoverId(deviceUserId, day.date, timeLeaveUsage)
    : null;

  return (
    <HomeGlassCard padding={14} style={styles.card}>
      <View style={[styles.header, mirroredRow(mirrorLayout)]}>
        <Text style={[styles.date, ltrText]} numberOfLines={1}>
          {formatDisplayDate(day.date)}
        </Text>
        {day.isHoliday ? (
          <Text style={styles.tagHoliday} numberOfLines={1}>
            {t('report.holiday')}
          </Text>
        ) : null}
        {day.isNotComing ? (
          <Text style={styles.tagAbsent} numberOfLines={1}>
            {t('report.didNotCome')}
          </Text>
        ) : null}
      </View>
      {!day.isHoliday && !day.isNotComing ? (
        <>
          <Text style={styles.line}>
            {t('report.entryTime')}:{' '}
            <Text style={[styles.mono, ltrText]}>
              {day.entryTime ? formatTime24(day.entryTime) : '—'}
            </Text>
            {' · '}
            {punchLabel(day.entryType)}
          </Text>
          <Text style={styles.line}>
            {t('report.exitTime')}:{' '}
            <Text style={[styles.mono, ltrText]}>
              {day.exitTime ? formatTime24(day.exitTime) : '—'}
            </Text>
            {' · '}
            {punchLabel(day.exitType)}
          </Text>
          {canManage ? (
            <View style={[styles.coverRow, mirroredRow(mirrorLayout)]}>
              {isLate && day.entryTime ? (
                entryCovered && entryCoverId ? (
                  <Pressable
                    disabled={coverBusy === entryCoverId}
                    onPress={() => void onRemove(entryCoverId)}
                  >
                    <Text style={styles.linkDanger}>{t('report.uncoverLate')}</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    disabled={!canAdd || coverBusy === day.entryTime}
                    onPress={() =>
                      void onCover({
                        deviceUserId,
                        date: day.date,
                        timestamp: day.entryTime!,
                        type: 'late_arrival',
                      })
                    }
                  >
                    <Text style={styles.link}>{t('report.coverLate')}</Text>
                  </Pressable>
                )
              ) : null}
              {isEarly ? (
                exitCovered && exitCoverId ? (
                  <Pressable
                    disabled={coverBusy === exitCoverId}
                    onPress={() => void onRemove(exitCoverId)}
                  >
                    <Text style={styles.linkDanger}>{t('report.uncoverEarly')}</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    disabled={!canAdd || coverBusy === day.date}
                    onPress={() =>
                      void onCover({
                        deviceUserId,
                        date: day.date,
                        timestamp: day.exitTime ?? day.date + 'T12:00:00.000',
                        type: 'early_exit',
                      })
                    }
                  >
                    <Text style={styles.link}>{t('report.coverEarly')}</Text>
                  </Pressable>
                )
              ) : null}
            </View>
          ) : null}
        </>
      ) : null}
    </HomeGlassCard>
  );
}

function createStyles(isDark: boolean) {
  const text = isDark ? '#E2E8F0' : '#334155';

  return StyleSheet.create({
    card: { marginBottom: 10 },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    date: {
      fontFamily: 'NotoSansArabic_700Bold',
      fontSize: 15,
      color: isDark ? '#F1F5F9' : '#0F172A',
    },
    tagHoliday: {
      fontSize: 11,
      fontWeight: '600',
      color: '#065f46',
      backgroundColor: '#d1fae5',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    tagAbsent: {
      fontSize: 11,
      fontWeight: '600',
      color: '#991b1b',
      backgroundColor: '#fee2e2',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    line: { fontSize: 13, color: text, marginTop: 4 },
    mono: { fontFamily: 'Inter_700Bold', fontVariant: ['tabular-nums'] },
    coverRow: { flexDirection: 'row', gap: 16, marginTop: 10 },
    link: { color: '#14B8A6', fontWeight: '600', fontSize: 13 },
    linkDanger: { color: '#DC2626', fontWeight: '600', fontSize: 13 },
  });
}
