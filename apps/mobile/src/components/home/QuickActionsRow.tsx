import { useMemo, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import { useI18n } from '../../i18n/I18nProvider';
import type { AppTypography } from '../../i18n/fonts';
import { mirroredRow } from '../../ui/rtlLayout';
import { HomeGlassCard } from './HomeGlassCard';
import { GLASS_INNER_CONTENT, GLASS_MUTED_DARK, GLASS_MUTED_LIGHT } from './homeGlass';

const CIRCLE = 56;
const ICON = 24;

const VARIANT_STYLE = {
  primary: {
    circle: { backgroundColor: '#14B8A6' },
    icon: '#FFFFFF',
  },
  daily: {
    circleLight: 'rgba(230, 247, 245, 0.95)',
    circleDark: 'rgba(20, 184, 166, 0.28)',
    icon: '#14B8A6',
  },
  report: {
    circleLight: 'rgba(234, 242, 254, 0.95)',
    circleDark: 'rgba(59, 130, 246, 0.28)',
    icon: '#3B82F6',
  },
  holidays: {
    circleLight: 'rgba(254, 245, 230, 0.95)',
    circleDark: 'rgba(245, 158, 11, 0.28)',
    icon: '#F59E0B',
  },
} as const;

type ActionDef = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: string;
  variant: 'primary' | 'daily' | 'report' | 'holidays';
  onPress: () => void;
};

export function QuickActionsRow({
  canManage,
  onManual,
  onDaily,
  onReport,
  onHolidays,
}: {
  canManage: boolean;
  onManual: () => void;
  onDaily: () => void;
  onReport: () => void;
  onHolidays: () => void;
}) {
  const { t } = useTranslation('attendance');
  const { mirrorLayout, typography } = useI18n();
  const { isDark } = useHomeTheme();
  const styles = useMemo(
    () => createStyles(isDark, typography),
    [isDark, typography],
  );

  const actions: ActionDef[] = [
    ...(canManage
      ? [
          {
            key: 'manual',
            icon: 'add' as const,
            labelKey: 'home.actionManual',
            variant: 'primary' as const,
            onPress: onManual,
          },
        ]
      : []),
    {
      key: 'daily',
      icon: 'calendar-outline',
      labelKey: 'home.actionDaily',
      variant: 'daily',
      onPress: onDaily,
    },
    {
      key: 'report',
      icon: 'bar-chart-outline',
      labelKey: 'home.actionReport',
      variant: 'report',
      onPress: onReport,
    },
    {
      key: 'holidays',
      icon: 'sunny-outline',
      labelKey: 'home.actionHolidays',
      variant: 'holidays',
      onPress: onHolidays,
    },
  ];

  return (
    <HomeGlassCard padding={20}>
      <View style={[styles.row, mirroredRow(mirrorLayout), GLASS_INNER_CONTENT]}>
        {actions.map((action) => (
          <ActionItem key={action.key} action={action} label={t(action.labelKey)} styles={styles} />
        ))}
      </View>
    </HomeGlassCard>
  );
}

function ActionItem({
  action,
  label,
  styles,
}: {
  action: ActionDef;
  label: string;
  styles: ReturnType<typeof createStyles>;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const { isDark } = useHomeTheme();
  const circleBg =
    action.variant === 'primary'
      ? VARIANT_STYLE.primary.circle.backgroundColor
      : isDark
        ? VARIANT_STYLE[action.variant].circleDark
        : VARIANT_STYLE[action.variant].circleLight;
  const iconColor =
    action.variant === 'primary' ? VARIANT_STYLE.primary.icon : VARIANT_STYLE[action.variant].icon;

  function pressIn() {
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  }

  function pressOut() {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 200,
    }).start();
  }

  function onPress() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action.onPress();
  }

  return (
    <View style={styles.item}>
      <Pressable
        onPress={onPress}
        onPressIn={pressIn}
        onPressOut={pressOut}
        accessibilityRole="button"
        style={styles.pressable}
      >
        <Animated.View
          style={[styles.circle, { backgroundColor: circleBg }, { transform: [{ scale }] }]}
        >
          <Ionicons name={action.icon} size={ICON} color={iconColor} />
        </Animated.View>
      </Pressable>
      <Text style={styles.label} numberOfLines={1} ellipsizeMode="tail">
        {label}
      </Text>
    </View>
  );
}

function createStyles(isDark: boolean, typography: AppTypography) {
  const labelMuted = isDark ? GLASS_MUTED_DARK : GLASS_MUTED_LIGHT;

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: 'transparent',
    },
    item: {
      flex: 1,
      alignItems: 'center',
      gap: 8,
      backgroundColor: 'transparent',
    },
    pressable: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    circle: {
      width: CIRCLE,
      height: CIRCLE,
      borderRadius: CIRCLE / 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontFamily: typography.noto.bold,
      fontSize: 12,
      lineHeight: 18,
      fontWeight: 'normal',
      color: labelMuted,
      textAlign: 'center',
      width: '100%',
      paddingHorizontal: 2,
    },
  });
}
