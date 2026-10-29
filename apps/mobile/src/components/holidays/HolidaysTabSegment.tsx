import { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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

export type HolidaysTabKey = 'official' | 'employee' | 'temporary' | 'settings';

type TabItem = { key: HolidaysTabKey; label: string };

export function HolidaysTabSegment({
  tabs,
  value,
  onChange,
}: {
  tabs: TabItem[];
  value: HolidaysTabKey;
  onChange: (key: HolidaysTabKey) => void;
}) {
  const { mirrorLayout, typography } = useI18n();
  const { isDark, palette } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography, palette.teal),
    [isDark, typography, palette.teal],
  );

  return (
    <HomeGlassCard padding={6}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, mirroredRow(mirrorLayout)]}
      >
        <View style={[styles.row, mirroredRow(mirrorLayout)]}>
          {tabs.map((tab) => {
            const active = tab.key === value;
            return (
              <Pressable
                key={tab.key}
                onPress={() => onChange(tab.key)}
                style={[styles.segment, active && styles.segmentActive]}
              >
                <Text style={[styles.label, active && styles.labelActive]} numberOfLines={1}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </HomeGlassCard>
  );
}

function createStyles(isDark: boolean, typography: AppTypography, teal: string) {
  const glassFill = isDark ? GLASS_FILL_DARK : GLASS_FILL_LIGHT;
  const muted = isDark ? '#94A3B8' : '#64748B';

  return StyleSheet.create({
    scroll: { flexGrow: 1 },
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
      borderRadius: 999,
      paddingVertical: 10,
      paddingHorizontal: 14,
      minHeight: 40,
      justifyContent: 'center',
    },
    segmentActive: { backgroundColor: teal },
    label: {
      fontFamily: typography.noto.bold,
      fontSize: 13,
      color: muted,
    },
    labelActive: { color: '#FFFFFF' },
  });
}
