import { useMemo, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { mirroredRow } from '../../ui/rtlLayout';
import { HomeGlassCard } from '../home/HomeGlassCard';
import {
  GLASS_BORDER_DARK,
  GLASS_BORDER_LIGHT,
  GLASS_FILL_DARK,
  GLASS_FILL_LIGHT,
} from '../home/homeGlass';

export type ReportTabKey = 'performance' | 'per-employee' | 'summary';

type TabItem = { key: ReportTabKey; label: string };

export function ReportTabSegment({
  tabs,
  value,
  onChange,
  trailing,
}: {
  tabs: TabItem[];
  value: ReportTabKey;
  onChange: (key: ReportTabKey) => void;
  /** Renders at the logical end of the row (e.g. PDF export). */
  trailing?: ReactNode;
}) {
  const { mirrorLayout, typography } = useI18n();
  const { isDark, palette } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography, palette.teal),
    [isDark, typography, palette.teal],
  );

  return (
    <View style={[styles.outer, mirroredRow(mirrorLayout)]}>
      <HomeGlassCard padding={6} style={styles.segmentCard}>
        <View style={[styles.row, mirroredRow(mirrorLayout)]}>
          {tabs.map((tab) => {
            const active = tab.key === value;
            return (
              <Pressable
                key={tab.key}
                onPress={() => onChange(tab.key)}
                style={[styles.segment, active && styles.segmentActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.label, active && styles.labelActive]} numberOfLines={2}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </HomeGlassCard>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </View>
  );
}

function createStyles(isDark: boolean, typography: AppTypography, teal: string) {
  const glassFill = isDark ? GLASS_FILL_DARK : GLASS_FILL_LIGHT;
  const muted = isDark ? '#94A3B8' : '#64748B';

  return StyleSheet.create({
    outer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    segmentCard: {
      flex: 1,
      minWidth: 0,
    },
    trailing: {
      flexShrink: 0,
    },
    row: {
      flexDirection: 'row',
      gap: 4,
      backgroundColor: glassFill,
      borderRadius: 999,
      padding: 4,
      borderWidth: 1,
      borderColor: isDark ? GLASS_BORDER_DARK : GLASS_BORDER_LIGHT,
      ...(Platform.OS === 'android' ? { elevation: 0 } : {}),
    },
    segment: {
      flex: 1,
      borderRadius: 999,
      paddingVertical: 10,
      paddingHorizontal: 6,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 44,
    },
    segmentActive: {
      backgroundColor: teal,
    },
    label: {
      fontFamily: typography.noto.bold,
      fontSize: 11,
      lineHeight: 15,
      color: muted,
      textAlign: 'center',
    },
    labelActive: {
      color: '#FFFFFF',
    },
  });
}
