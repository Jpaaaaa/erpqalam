import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import {
  FLOATING_TAB_BAR_BOTTOM,
  FLOATING_TAB_BAR_HEIGHT,
} from '../theme/homeTheme';
import { useHomeTheme } from '../theme/HomeThemeProvider';
import { AppText } from '../ui/AppText';
import { HomeGlassBar } from '../components/home/HomeGlassBar';

const ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Overview: { active: 'home', inactive: 'home-outline' },
  RecordsTab: { active: 'list', inactive: 'list-outline' },
  ShiftTab: { active: 'time', inactive: 'time-outline' },
  MoreTab: { active: 'ellipsis-horizontal', inactive: 'ellipsis-horizontal-outline' },
};

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { palette } = useHomeTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <View
      style={[
        styles.outer,
        { paddingBottom: insets.bottom + FLOATING_TAB_BAR_BOTTOM },
      ]}
      pointerEvents="box-none"
    >
      <HomeGlassBar style={styles.barShell}>
        <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? String(options.tabBarLabel)
              : options.title ?? route.name;
          const focused = state.index === index;
          const icons = ICONS[route.name] ?? ICONS.MoreTab;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
              style={styles.tab}
            >
              <Ionicons
                name={focused ? icons.active : icons.inactive}
                size={22}
                color={focused ? palette.teal : palette.tabBarInactive}
              />
              <AppText
                style={[styles.label, focused && styles.labelActive]}
                numberOfLines={1}
              >
                {label}
              </AppText>
            </Pressable>
          );
        })}
        </View>
      </HomeGlassBar>
    </View>
  );
}

function createStyles(p: ReturnType<typeof useHomeTheme>['palette']) {
  return StyleSheet.create({
    outer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
    },
    barShell: {
      width: '92%',
      maxWidth: 420,
    },
    bar: {
      flexDirection: 'row',
      paddingHorizontal: 8,
      paddingVertical: 8,
      minHeight: FLOATING_TAB_BAR_HEIGHT,
      backgroundColor: 'transparent',
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 4,
    },
    label: {
      fontSize: 11,
      fontWeight: '600',
      color: p.tabBarInactive,
    },
    labelActive: { color: p.teal },
  });
}
