import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { formatRecordsDayHeading } from '../../attendance/recordsDayTitle';
import type { AttendanceRecord, DailyAttendanceSummary } from '../../types/attendance';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { ltrText } from '../../ui/ltr';
import { mirroredRow } from '../../ui/rtlLayout';
import { HomeGlassCard } from '../home/HomeGlassCard';
import { GLASS_INNER_CONTENT, GLASS_MUTED_DARK, GLASS_MUTED_LIGHT } from '../home/homeGlass';
import { RecordsPunchRow } from './RecordsPunchRow';

function SummaryDots({
  summary,
  styles,
}: {
  summary?: DailyAttendanceSummary;
  styles: ReturnType<typeof createStyles>;
}) {
  if (!summary) {
    return (
      <Text style={styles.summaryLoading}>…</Text>
    );
  }

  return (
    <View style={styles.summaryRow}>
      <View style={styles.stat}>
        <View style={[styles.dot, { backgroundColor: '#14B8A6' }]} />
        <Text style={[styles.statNum, { color: '#14B8A6' }]}>{summary.present}</Text>
      </View>
      <View style={styles.stat}>
        <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
        <Text style={[styles.statNum, { color: '#F59E0B' }]}>{summary.late}</Text>
      </View>
      <View style={styles.stat}>
        <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
        <Text style={[styles.statNum, { color: '#EF4444' }]}>{summary.absent}</Text>
      </View>
    </View>
  );
}

export function RecordsDayCard({
  date,
  records,
  summary,
  expanded,
  nameLookup,
  onToggle,
  onRowPress,
}: {
  date: string;
  records: AttendanceRecord[];
  summary?: DailyAttendanceSummary;
  expanded: boolean;
  nameLookup: Map<string, string>;
  onToggle: () => void;
  onRowPress: (deviceUserId: string, name: string) => void;
}) {
  const { t } = useTranslation('attendance');
  const { locale, mirrorLayout, typography } = useI18n();
  const { isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );
  const heading = formatRecordsDayHeading(date, locale, t);

  return (
    <HomeGlassCard padding={0} style={styles.card}>
      <View style={[GLASS_INNER_CONTENT]}>
        <Pressable
          onPress={onToggle}
          style={({ pressed }) => [
            styles.header,
            mirroredRow(mirrorLayout),
            pressed && styles.headerPressed,
          ]}
          accessibilityRole="button"
        >
          <Text style={styles.headerTitle} numberOfLines={2}>
            {heading}
          </Text>
          <View style={[styles.headerEnd, mirroredRow(mirrorLayout)]}>
            <SummaryDots summary={summary} styles={styles} />
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={isDark ? GLASS_MUTED_DARK : GLASS_MUTED_LIGHT}
            />
          </View>
        </Pressable>

        {expanded
          ? records.map((record, index) => {
              const rawName = nameLookup.get(record.deviceUserId);
              const name = rawName?.trim() || record.deviceUserId;
              return (
                <View key={record.id} style={styles.rowWrap}>
                  <RecordsPunchRow
                    record={record}
                    name={name}
                    isLast={index === records.length - 1}
                    onPress={() => onRowPress(record.deviceUserId, name)}
                  />
                </View>
              );
            })
          : null}
      </View>
    </HomeGlassCard>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const muted = isDark ? GLASS_MUTED_DARK : GLASS_MUTED_LIGHT;

  return StyleSheet.create({
    card: {
      marginBottom: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: 'transparent',
    },
    headerPressed: { opacity: 0.9 },
    headerTitle: {
      flex: 1,
      fontFamily: typography.noto.bold,
      fontSize: 15,
      lineHeight: 22,
      color: text,
      minWidth: 0,
    },
    headerEnd: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexShrink: 0,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    stat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statNum: {
      fontFamily: typography.inter.bold,
      fontSize: 13,
      lineHeight: 16,
      fontVariant: ['tabular-nums'],
      ...ltrText,
    },
    summaryLoading: {
      fontFamily: typography.inter.bold,
      fontSize: 13,
      color: muted,
    },
    rowWrap: {
      paddingHorizontal: 16,
      backgroundColor: 'transparent',
    },
  });
}
