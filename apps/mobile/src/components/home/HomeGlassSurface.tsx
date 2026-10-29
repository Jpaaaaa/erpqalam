import { type ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useHomeTheme } from '../../theme/HomeThemeProvider';
import {
  GLASS_BORDER_DARK,
  GLASS_BORDER_LIGHT,
  GLASS_RADIUS,
  isHomeGlassBlurEnabled,
} from './homeGlass';
import { useHomeBlurTarget } from './HomeBlurTargetContext';

type Props = {
  children: ReactNode;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  intensity: number;
  overlayColor: string;
  fallbackColor: string;
  /** Tab bar and other surfaces outside the home blur target use overlay only. */
  nativeBlur?: boolean;
};

export function HomeGlassSurface({
  children,
  padding,
  style,
  contentStyle,
  intensity,
  overlayColor,
  fallbackColor,
  nativeBlur = true,
}: Props) {
  const { isDark } = useHomeTheme();
  const blurCtx = useHomeBlurTarget();
  const borderColor = isDark ? GLASS_BORDER_DARK : GLASS_BORDER_LIGHT;
  const tint = isDark ? 'dark' : 'light';

  const blurEnabled = isHomeGlassBlurEnabled() && nativeBlur;
  const showBlur =
    blurEnabled &&
    (Platform.OS === 'ios' || (blurCtx?.ready ?? false));
  const blurTarget = blurCtx?.ref;

  return (
    <View
      style={[
        styles.shadowHost,
        Platform.OS === 'android' ? styles.shadowHostAndroid : styles.shadowHostIos,
        style,
      ]}
    >
      <View style={[styles.surface, { borderColor }]}>
        {showBlur ? (
          <BlurView
            blurTarget={blurTarget ?? undefined}
            intensity={intensity}
            tint={tint}
            style={[styles.backdrop, styles.backdropBlur]}
            blurMethod={
              Platform.OS === 'android'
                ? Platform.Version >= 31
                  ? 'dimezisBlurViewSdk31Plus'
                  : 'dimezisBlurView'
                : undefined
            }
          />
        ) : null}
        <View
          pointerEvents="none"
          style={[
            styles.backdrop,
            { backgroundColor: showBlur ? overlayColor : fallbackColor },
          ]}
        />
        <View
          style={[
            styles.content,
            padding != null ? { padding } : null,
            contentStyle,
          ]}
        >
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowHost: {
    borderRadius: GLASS_RADIUS,
    backgroundColor: 'transparent',
  },
  /** Elevation on translucent views bleeds through on Android — border only. */
  shadowHostAndroid: {
    elevation: 0,
  },
  shadowHostIos: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
  },
  surface: {
    borderRadius: GLASS_RADIUS,
    overflow: 'hidden',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  backdropBlur: {
    backgroundColor: 'transparent',
  },
  content: {
    backgroundColor: 'transparent',
  },
});
