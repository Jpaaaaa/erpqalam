import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatRecordsDayHeading } from '../../attendance/recordsDayTitle';
import { formatTime24, timestampToDateKey } from '../../attendance/formatters';
import { isManualVerify } from '../../attendance/employeeDetailStats';
import type { AttendanceRecord, PunchType } from '../../types/attendance';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { ltrText } from '../../ui/ltr';
import { HomeGlassCard } from '../home/HomeGlassCard';
import { GLASS_INNER_CONTENT, GLASS_MUTED_DARK, GLASS_MUTED_LIGHT } from '../home/homeGlass';

const DOT: Partial<Record<PunchType, string>> = {
  entry_on_time: '#14B8A6',
  entry_late: '#F59E0B',
  exit: '#94A3B8',
  early_exit: '#F97316',
  out_of_shift: '#94A3B8',
};

function pillStyle(punchType?: PunchType | null, isDark?: boolean) {
  switch (punchType) {
    case 'entry_on_time':
      return { bg: 'rgba(20, 184, 166, 0.14)', ink: '#0D9488' };
    case 'entry_late':
      return { bg: 'rgba(245, 158, 11, 0.16)', ink: '#B45309' };
    case 'early_exit':
      return { bg: 'rgba(249, 115, 22, 0.16)', ink: '#EA580C' };
    default:
      return {
        bg: isDark ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.16)',
        ink: isDark ? '#94A3B8' : '#64748B',
      };
  }
}

export function EmployeeDetailTimeline({ records }: { records: AttendanceRecord[] }) {
  const { t } = useTranslation('attendance');
  const { locale, typography } = useI18n();
  const { isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  const groups = useMemo(() => {
    const map = new Map<string, AttendanceRecord[]>();
    for (const r of records) {
      const key = timestampToDateKey(r.timestamp);
      const list = map.get(key) ?? [];
      list.push(r);
      map.set(key, list);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, items]) => ({
        date,
        items: [...items].sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
      }));
  }, [records]);

  if (groups.length === 0) return null;

  return (
    <HomeGlassCard padding={0}>
      <View style={GLASS_INNER_CONTENT}>
        {groups.map((group, gi) => (
          <View key={group.date}>
            <Text style={styles.dayHeader}>
              {formatRecordsDayHeading(group.date, locale, t)}
            </Text>
            {group.items.map((record, ri) => {
              const punchKey =
                record.punchType && record.punchType in DOT ? record.punchType : null;
              const label = punchKey
                ? t(`punchTypes.${punchKey}`)
                : t('punchTypes.unknown');
              const statusKey =
                punchKey === 'entry_on_time'
                  ? 'daily.status.on_time'
                  : punchKey === 'entry_late'
                    ? 'daily.status.late'
                    : punchKey === 'early_exit'
                      ? 'daily.status.early_exit'
                      : 'punchTypes.exit';
              const pill = pillStyle(record.punchType, isDark);
              const isLast =
                gi === groups.length - 1 && ri === group.items.length - 1;
              const duplicate = record.ignoredDuplicate === true;

              return (
                <View
                  key={record.id}
                  style={[
                    styles.row,
                    !isLast && styles.rowDivider,
                    duplicate && styles.rowMuted,
                  ]}
                >
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor:
                          (punchKey && DOT[punchKey]) || '#94A3B8',
                      },
                    ]}
                  />
                  <View style={styles.body}>
                    <Text style={styles.punchType} numberOfLines={1}>
                      {label}
                    </Text>
                    <View style={styles.tagRow}>
                      {duplicate ? (
                        <Text style={styles.dupTag}>{t('records.duplicateTag')}</Text>
                      ) : null}
                      {isManualVerify(record.verifyType) ? (
                        <Text style={styles.manualTag}>{t('employeeDetail.manualTag')}</Text>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.end}>
                    <Text style={[styles.time, duplicate && styles.timeMuted]}>
                      {formatTime24(record.timestamp)}
                    </Text>
                    <View style={[styles.pill, { backgroundColor: pill.bg }]}>
                      <Text style={[styles.pillText, { color: pill.ink }]} numberOfLines={1}>
                        {t(statusKey)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </HomeGlassCard>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const muted = isDark ? GLASS_MUTED_DARK : GLASS_MUTED_LIGHT;
  const divider = isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.08)';

  return StyleSheet.create({
    dayHeader: {
      fontFamily: typography.noto.bold,
      fontSize: 14,
      lineHeight: 20,
      color: text,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    rowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: divider,
    },
    rowMuted: { opacity: 0.55 },
    tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    dupTag: {
      fontFamily: typography.noto.medium,
      fontSize: 10,
      color: muted,
      backgroundColor: isDark ? 'rgba(100, 116, 139, 0.35)' : 'rgba(148, 163, 184, 0.35)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    dot: { width: 8, height: 8, borderRadius: 4 },
    body: { flex: 1, minWidth: 0, gap: 2 },
    punchType: {
      fontFamily: typography.noto.medium,
      fontSize: 13,
      lineHeight: 18,
      color: text,
    },
    manualTag: {
      fontFamily: typography.noto.medium,
      fontSize: 10,
      color: muted,
      alignSelf: 'flex-start',
      backgroundColor: isDark ? 'rgba(148, 163, 184, 0.16)' : 'rgba(148, 163, 184, 0.14)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    end: { alignItems: 'flex-end', gap: 4, maxWidth: 112 },
    time: {
      fontFamily: typography.inter.bold,
      fontSize: 15,
      lineHeight: 18,
      color: text,
      fontVariant: ['tabular-nums'],
      ...ltrText,
    },
    timeMuted: { color: muted },
    pill: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      maxWidth: 96,
    },
    pillText: {
      fontFamily: typography.noto.medium,
      fontSize: 10,
      lineHeight: 13,
      textAlign: 'center',
    },
  });
}
