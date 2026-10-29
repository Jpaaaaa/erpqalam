import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { EmployeeReportRow } from '../../types/attendance';
import { displayName } from '../../attendance/formatters';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { HomeGlassCard } from '../home/HomeGlassCard';
import { GLASS_INNER_CONTENT, GLASS_MUTED_DARK, GLASS_MUTED_LIGHT } from '../home/homeGlass';
import { MiniTripleRings } from '../employeeDetail/MiniTripleRings';
import { ltrText } from '../../ui/ltr';
import { mirroredRow } from '../../ui/rtlLayout';
import { rowAttendancePct, attendancePctColor } from './reportPerformance';

type Props = {
  rows: EmployeeReportRow[];
  nameLookup: Map<string, string>;
  attendancePct: number;
  punctualityPct: number;
  leaveUsedPct: number;
  totals: { present: number; late: number; absent: number; early: number };
  onPressEmployee: (deviceUserId: string, name: string) => void;
};

export function ReportSummaryTab({
  rows,
  nameLookup,
  attendancePct,
  punctualityPct,
  leaveUsedPct,
  totals,
  onPressEmployee,
}: Props) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout, typography } = useI18n();
  const { isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  const ranked = useMemo(() => {
    return [...rows]
      .filter((r) => r.expectedWorkingDays > 0)
      .sort((a, b) => rowAttendancePct(b) - rowAttendancePct(a));
  }, [rows]);

  const best = ranked.slice(0, 3);
  const needs = [...ranked].reverse().slice(0, 3);

  const statTiles = [
    { key: 'present', label: t('report.summaryTile.present'), value: totals.present, color: '#14B8A6' },
    { key: 'late', label: t('report.summaryTile.late'), value: totals.late, color: '#D97706' },
    { key: 'absent', label: t('report.summaryTile.absent'), value: totals.absent, color: '#EF4444' },
    { key: 'early', label: t('report.summaryTile.early'), value: totals.early, color: '#EA580C' },
  ];

  return (
    <View style={styles.wrap}>
      <HomeGlassCard padding={16}>
        <View style={[GLASS_INNER_CONTENT, styles.hero]}>
          <MiniTripleRings
            attendancePct={attendancePct}
            punctualityPct={punctualityPct}
            leavePct={leaveUsedPct}
            centerLabel={`${attendancePct}%`}
          />
        </View>
      </HomeGlassCard>

      <View style={styles.tileGrid}>
        {statTiles.map((tile) => (
          <HomeGlassCard key={tile.key} padding={12} style={styles.tile}>
            <Text style={[styles.tileValue, ltrText, { color: tile.color }]}>
              {tile.value}
            </Text>
            <Text style={styles.tileLabel} numberOfLines={2}>
              {tile.label}
            </Text>
          </HomeGlassCard>
        ))}
      </View>

      <MiniList
        title={t('report.summary.best')}
        rows={best}
        nameLookup={nameLookup}
        styles={styles}
        mirrorLayout={mirrorLayout}
        onPress={onPressEmployee}
      />
      <MiniList
        title={t('report.summary.needsAttention')}
        rows={needs}
        nameLookup={nameLookup}
        styles={styles}
        mirrorLayout={mirrorLayout}
        onPress={onPressEmployee}
        invertColor
      />
    </View>
  );
}

function MiniList({
  title,
  rows,
  nameLookup,
  styles,
  mirrorLayout,
  onPress,
  invertColor,
}: {
  title: string;
  rows: EmployeeReportRow[];
  nameLookup: Map<string, string>;
  styles: ReturnType<typeof createStyles>;
  mirrorLayout: boolean;
  onPress: (id: string, name: string) => void;
  invertColor?: boolean;
}) {
  if (rows.length === 0) return null;

  return (
    <View style={styles.listSection}>
      <Text style={styles.listTitle}>{title}</Text>
      <HomeGlassCard padding={0}>
        {rows.map((row, index) => {
          const name = displayName(nameLookup.get(row.deviceUserId), row.deviceUserId);
          const pct = rowAttendancePct(row);
          const color = invertColor ? attendancePctColor(pct) : '#14B8A6';
          return (
            <Pressable
              key={row.deviceUserId}
              onPress={() => onPress(row.deviceUserId, name)}
              style={({ pressed }) => [
                styles.listRow,
                mirroredRow(mirrorLayout),
                index < rows.length - 1 && styles.listDivider,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.listName} numberOfLines={1}>
                {name}
              </Text>
              <Text style={[styles.listPct, ltrText, { color }]}>{pct}%</Text>
            </Pressable>
          );
        })}
      </HomeGlassCard>
    </View>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';
  const muted = isDark ? GLASS_MUTED_DARK : GLASS_MUTED_LIGHT;
  const divider = isDark ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.08)';

  return StyleSheet.create({
    wrap: { gap: 16 },
    hero: { alignItems: 'center' },
    tileGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    tile: {
      width: '48%',
      flexGrow: 1,
      minWidth: '46%',
    },
    tileValue: {
      fontFamily: typography.inter.extraBold,
      fontSize: 22,
      lineHeight: 28,
      fontVariant: ['tabular-nums'],
    },
    tileLabel: {
      fontFamily: typography.noto.medium,
      fontSize: 12,
      lineHeight: 16,
      color: muted,
      marginTop: 4,
    },
    listSection: { gap: 8 },
    listTitle: {
      fontFamily: typography.noto.bold,
      fontSize: 14,
      color: text,
      paddingHorizontal: 4,
    },
    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    listDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: divider,
    },
    pressed: { opacity: 0.9 },
    listName: {
      fontFamily: typography.noto.bold,
      fontSize: 14,
      color: text,
      flex: 1,
    },
    listPct: {
      fontFamily: typography.inter.bold,
      fontSize: 15,
      fontVariant: ['tabular-nums'],
    },
  });
}
