import { type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import {
  GLASS_FALLBACK_DARK,
  GLASS_FALLBACK_LIGHT,
  GLASS_FILL_DARK,
  GLASS_FILL_LIGHT,
  GLASS_INNER_CONTENT,
  GLASS_INTENSITY,
} from './homeGlass';
import { HomeGlassSurface } from './HomeGlassSurface';

type Props = {
  children: ReactNode;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function HomeGlassCard({
  children,
  padding = 20,
  style,
  contentStyle,
}: Props) {
  const { isDark } = useHomeTheme();

  return (
    <HomeGlassSurface
      padding={padding}
      style={style}
      contentStyle={[GLASS_INNER_CONTENT, contentStyle]}
      intensity={GLASS_INTENSITY}
      overlayColor={isDark ? GLASS_FILL_DARK : GLASS_FILL_LIGHT}
      fallbackColor={isDark ? GLASS_FALLBACK_DARK : GLASS_FALLBACK_LIGHT}
    >
      {children}
    </HomeGlassSurface>
  );
}
