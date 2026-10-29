import { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { EmployeeLeaveGroup } from '../../attendance/holidayRanges';
import { formatHolidayDateRangeWords } from '../../attendance/holidayFormatters';
import { displayName } from '../../attendance/formatters';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { HomeGlassCard } from '../home/HomeGlassCard';
import { mirroredRow } from '../../ui/rtlLayout';

function isLatinInitial(ch: string): boolean {
  return /^[A-Za-z0-9]$/.test(ch);
}

export function HolidaysEmployeeListCard({
  groups,
  nameLookup,
  balanceLookup,
  canManage,
  onDeleteIds,
}: {
  groups: EmployeeLeaveGroup[];
  nameLookup: Map<string, string>;
  balanceLookup: Map<string, number>;
  canManage: boolean;
  onDeleteIds: (ids: string[]) => Promise<void>;
}) {
  const { t } = useTranslation('attendance');
  const { locale, mirrorLayout, typography } = useI18n();
  const { isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  return (
    <HomeGlassCard padding={0}>
      {groups.map((group, gIndex) => {
        const name = displayName(nameLookup.get(group.deviceUserId), group.deviceUserId);
        const initial = (name.charAt(0) || '?').toUpperCase();
        const initialFont = isLatinInitial(initial)
          ? typography.inter.bold
          : typography.noto.bold;
        const balance = balanceLookup.get(group.deviceUserId) ?? 0;
        const isLastGroup = gIndex === groups.length - 1;
        const datesText = group.ranges
          .map((r) => formatHolidayDateRangeWords(locale, r.fromDate, r.toDate))
          .join(' · ');

        function confirmDelete() {
          const allIds = group.ranges.flatMap((r) => r.ids);
          Alert.alert(t('holidays.removeConfirmTitle'), t('holidays.removeConfirmMessage'), [
            { text: t('records.cancel'), style: 'cancel' },
            {
              text: t('holidays.remove'),
              style: 'destructive',
              onPress: () => void onDeleteIds(allIds),
            },
          ]);
        }

        return (
          <Pressable
            key={group.deviceUserId}
            onLongPress={canManage ? confirmDelete : undefined}
            style={({ pressed }) => [
              styles.group,
              !isLastGroup && styles.groupDivider,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.row, mirroredRow(mirrorLayout)]}>
              <View style={styles.avatar}>
                <Text style={[styles.avatarLetter, { fontFamily: initialFont }]}>
                  {initial}
                </Text>
              </View>
              <View style={styles.body}>
                <Text style={styles.name} numberOfLines={1}>
                  {name}
                </Text>
                <Text style={styles.dates} numberOfLines={2}>
                  {datesText}
                </Text>
                <Text style={styles.used}>
                  {t('holidays.daysUsed', { count: group.totalDays })}
                </Text>
              </View>
              <View style={styles.balancePill}>
                <Text style={styles.balanceText} numberOfLines={1}>
                  {t('report.leaveShort', { days: balance })}
                </Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </HomeGlassCard>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const muted = isDark ? '#94A3B8' : '#64748B';
  const divider = isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.08)';

  return StyleSheet.create({
    group: { paddingHorizontal: 16, paddingVertical: 14 },
    groupDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: divider,
    },
    pressed: { opacity: 0.9 },
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(139, 92, 246, 0.28)' : 'rgba(139, 92, 246, 0.14)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarLetter: { fontSize: 16, color: '#7C3AED' },
    body: { flex: 1, minWidth: 0, gap: 2 },
    name: {
      fontFamily: typography.noto.bold,
      fontSize: 14,
      color: text,
    },
    dates: {
      fontFamily: typography.noto.medium,
      fontSize: 12,
      color: muted,
      lineHeight: 17,
    },
    used: {
      fontFamily: typography.inter.bold,
      fontSize: 12,
      color: muted,
      fontVariant: ['tabular-nums'],
    },
    balancePill: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: isDark ? 'rgba(139, 92, 246, 0.22)' : 'rgba(139, 92, 246, 0.12)',
      maxWidth: 88,
    },
    balanceText: {
      fontFamily: typography.noto.medium,
      fontSize: 10,
      color: isDark ? '#C4B5FD' : '#6D28D9',
      textAlign: 'center',
    },
  });
}
