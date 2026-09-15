import { I18nManager, type ViewStyle } from 'react-native';

/**
 * True when locale is RTL but native I18nManager has not flipped (Expo Go).
 * Standalone/dev builds after forceRTL + restart should leave this false.
 */
export function needsJsMirror(isRtl: boolean): boolean {
  return isRtl && !I18nManager.isRTL;
}

/** Row containers that rely on native RTL auto-flip need row-reverse in Expo Go. */
export function mirroredRow(mirrorLayout: boolean): ViewStyle {
  return { flexDirection: mirrorLayout ? 'row-reverse' : 'row' };
}

/** marginStart/End only flip with native I18nManager RTL. */
export function inlineEndGap(mirrorLayout: boolean, size = 8): ViewStyle {
  return mirrorLayout ? { marginLeft: size } : { marginRight: size };
}
