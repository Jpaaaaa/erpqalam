import { type ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import {
  GLASS_RADIUS,
  TAB_BAR_GLASS_INTENSITY,
  TAB_BAR_SOLID_BORDER_DARK,
  TAB_BAR_SOLID_BORDER_LIGHT,
  TAB_BAR_SOLID_DARK,
  TAB_BAR_SOLID_LIGHT,
  tabBarOverlayColors,
} from './homeGlass';
import { HomeGlassSurface } from './HomeGlassSurface';

export function HomeGlassBar({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { isDark } = useHomeTheme();

  if (Platform.OS === 'android') {
    return (
      <View
        style={[
          styles.androidSurface,
          {
            backgroundColor: isDark ? TAB_BAR_SOLID_DARK : TAB_BAR_SOLID_LIGHT,
            borderColor: isDark ? TAB_BAR_SOLID_BORDER_DARK : TAB_BAR_SOLID_BORDER_LIGHT,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  const tabFill = tabBarOverlayColors(isDark);

  return (
    <HomeGlassSurface
      style={style}
      nativeBlur={false}
      intensity={TAB_BAR_GLASS_INTENSITY}
      overlayColor={tabFill.overlay}
      fallbackColor={tabFill.fallback}
    >
      {children}
    </HomeGlassSurface>
  );
}

const styles = StyleSheet.create({
  androidSurface: {
    borderRadius: GLASS_RADIUS,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 0,
  },
});
