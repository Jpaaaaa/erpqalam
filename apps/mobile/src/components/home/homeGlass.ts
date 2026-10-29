import { Platform, type ViewStyle } from 'react-native';

export const HOME_BG_LIGHT = '#F4F6F8';
export const HOME_BG_DARK = '#0F141A';

export const GLASS_RADIUS = 28;
export const GLASS_INTENSITY = 40;
export const TAB_BAR_GLASS_INTENSITY = 60;

export const GLASS_FILL_LIGHT = 'rgba(255, 255, 255, 0.6)';
export const GLASS_FILL_DARK = 'rgba(31, 38, 48, 0.6)';
export const GLASS_FALLBACK_LIGHT = 'rgba(255, 255, 255, 0.88)';
export const GLASS_FALLBACK_DARK = 'rgba(31, 38, 48, 0.88)';

export const TAB_BAR_FILL_LIGHT = 'rgba(255, 255, 255, 0.88)';
export const TAB_BAR_FILL_DARK = 'rgba(22, 27, 34, 0.9)';
export const TAB_BAR_FILL_ANDROID_LIGHT = 'rgba(255, 255, 255, 0.96)';
export const TAB_BAR_FILL_ANDROID_DARK = 'rgba(22, 27, 34, 0.96)';

/** Opaque floating tab bar (Android). */
export const TAB_BAR_SOLID_LIGHT = '#FFFFFF';
export const TAB_BAR_SOLID_DARK = '#1A2029';
export const TAB_BAR_SOLID_BORDER_LIGHT = 'rgba(15, 23, 42, 0.06)';
export const TAB_BAR_SOLID_BORDER_DARK = 'rgba(255, 255, 255, 0.08)';

export const GLASS_BORDER_LIGHT = 'rgba(255, 255, 255, 0.6)';
export const GLASS_BORDER_DARK = 'rgba(255, 255, 255, 0.08)';

/** Muted copy on glass — ≥ 4.5:1 on light fill. */
export const GLASS_MUTED_LIGHT = '#475569';
export const GLASS_MUTED_DARK = '#94A3B8';

/** Card body wrappers — no fill; glass lives on the outer surface only. */
export const GLASS_INNER_CONTENT: ViewStyle = { backgroundColor: 'transparent' };

export function tabBarOverlayColors(isDark: boolean): { overlay: string; fallback: string } {
  if (Platform.OS === 'android') {
    return isDark
      ? {
          overlay: TAB_BAR_FILL_ANDROID_DARK,
          fallback: TAB_BAR_FILL_ANDROID_DARK,
        }
      : {
          overlay: TAB_BAR_FILL_ANDROID_LIGHT,
          fallback: TAB_BAR_FILL_ANDROID_LIGHT,
        };
  }
  return isDark
    ? { overlay: TAB_BAR_FILL_DARK, fallback: GLASS_FALLBACK_DARK }
    : { overlay: TAB_BAR_FILL_LIGHT, fallback: GLASS_FALLBACK_LIGHT };
}

export function isHomeGlassBlurEnabled(): boolean {
  if (Platform.OS === 'web') return false;
  if (process.env.EXPO_PUBLIC_HOME_GLASS_FALLBACK === '1') return false;
  return true;
}

/** Absolute fill clipped to glass radius (BlurView + overlay). */
export function glassLayerStyle(radius: number = GLASS_RADIUS) {
  return {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radius,
  };
}
