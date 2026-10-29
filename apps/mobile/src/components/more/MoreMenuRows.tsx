import { useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { mirroredRow } from '../../ui/rtlLayout';
import { rowChevron } from '../../ui/chevronIcons';
import { HomeGlassCard } from '../home/HomeGlassCard';
import {
  GLASS_BORDER_DARK,
  GLASS_BORDER_LIGHT,
} from '../home/homeGlass';

const TILE = 36;
const TILE_RADIUS = 10;

export type MoreMenuRowConfig = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  tileBg: string;
  filled?: boolean;
  onPress: () => void;
};

export function MoreMenuGroupedCard({ rows }: { rows: MoreMenuRowConfig[] }) {
  const { isDark } = useHomeTheme();
  const { mirrorLayout, typography, isRtl } = useI18n();
  const rtl = isRtl || mirrorLayout;
  const styles = useMemo(
    () => createRowStyles(isDark, typography),
    [isDark, typography],
  );
  const dividerColor = isDark ? GLASS_BORDER_DARK : GLASS_BORDER_LIGHT;
  const chevronColor = isDark ? '#64748B' : '#94A3B8';

  return (
    <HomeGlassCard padding={0}>
      {rows.map((row, index) => {
        const isLast = index === rows.length - 1;
        return (
          <Pressable
            key={row.key}
            onPress={row.onPress}
            style={({ pressed }) => [
              styles.row,
              mirroredRow(mirrorLayout),
              !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: dividerColor },
              pressed && styles.rowPressed,
            ]}
            accessibilityRole="button"
          >
            <View
              style={[
                styles.iconTile,
                row.filled
                  ? { backgroundColor: row.iconColor }
                  : { backgroundColor: row.tileBg },
              ]}
            >
              <Ionicons
                name={row.icon}
                size={20}
                color={row.filled ? '#FFFFFF' : row.iconColor}
              />
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {row.label}
            </Text>
            <Ionicons name={rowChevron(rtl)} size={18} color={chevronColor} />
          </Pressable>
        );
      })}
    </HomeGlassCard>
  );
}

function createRowStyles(isDark: boolean, typography: AppTypography) {
  const text = isDark ? '#F1F5F9' : '#0F172A';

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      minHeight: 56,
    },
    rowPressed: { opacity: 0.88 },
    iconTile: {
      width: TILE,
      height: TILE,
      borderRadius: TILE_RADIUS,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      flex: 1,
      fontFamily: typography.noto.medium,
      fontSize: 15,
      lineHeight: 22,
      color: text,
      minWidth: 0,
    },
  });
}
