import type { ViewStyle } from 'react-native';

export type HomePalette = {
  bg: string;
  card: string;
  cardElevated: string;
  border: string;
  text: string;
  textMuted: string;
  teal: string;
  blue: string;
  purple: string;
  /** Late / warning — tuned per mode for contrast on card tiles */
  yellow: string;
  /** Absent — tuned per mode */
  red: string;
  livePillBg: string;
  tabBarBg: string;
  tabBarInactive: string;
  ringTrack: string;
  /** Text/icons on teal fills (avatar, + button) */
  onTeal: string;
  /** Applied to main cards in light mode; omitted in dark */
  cardShadow: ViewStyle | null;
  radiusCard: number;
  radiusInner: number;
  radiusPill: number;
  radiusAction: number;
};

export const homeLightPalette: HomePalette = {
  bg: '#F4F6F8',
  card: '#FFFFFF',
  cardElevated: '#F1F5F9',
  border: '#E2E8F0',
  text: '#0F172A',
  textMuted: '#475569',
  teal: '#14B8A6',
  blue: '#2563EB',
  purple: '#7C3AED',
  yellow: '#B45309',
  red: '#DC2626',
  livePillBg: 'rgba(20, 184, 166, 0.12)',
  tabBarBg: '#FFFFFF',
  tabBarInactive: '#94A3B8',
  ringTrack: '#E2E8F0',
  onTeal: '#FFFFFF',
  cardShadow: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  radiusCard: 22,
  radiusInner: 14,
  radiusPill: 20,
  radiusAction: 28,
};

export const homeDarkPalette: HomePalette = {
  bg: '#0F141A',
  card: '#1F2630',
  cardElevated: '#2A3340',
  border: '#2A3340',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  teal: '#2DD4BF',
  blue: '#60A5FA',
  purple: '#A78BFA',
  yellow: '#FBBF24',
  red: '#F87171',
  livePillBg: 'rgba(45, 212, 191, 0.15)',
  tabBarBg: '#1F2630',
  tabBarInactive: '#64748B',
  ringTrack: '#2A3340',
  onTeal: '#161B22',
  cardShadow: null,
  radiusCard: 22,
  radiusInner: 14,
  radiusPill: 20,
  radiusAction: 28,
};

export function resolveHomePalette(isDark: boolean): HomePalette {
  return isDark ? homeDarkPalette : homeLightPalette;
}

export const FLOATING_TAB_BAR_BOTTOM = 12;
export const FLOATING_TAB_BAR_HEIGHT = 64;
/**
 * Vertical footprint of the floating tab bar (pill + bottom margin above safe area).
 * Home scroll: tabBarHeight + insets.bottom + 32.
 */
export const FLOATING_TAB_BAR_TOTAL_HEIGHT =
  FLOATING_TAB_BAR_HEIGHT + FLOATING_TAB_BAR_BOTTOM;

export function overviewScrollPaddingBottom(insetsBottom: number): number {
  return FLOATING_TAB_BAR_TOTAL_HEIGHT + insetsBottom + 32;
}

export const HOME_SCROLL_BOTTOM_PAD =
  FLOATING_TAB_BAR_TOTAL_HEIGHT + 24;

export const TAB_SCENE_BOTTOM_PAD = HOME_SCROLL_BOTTOM_PAD;

export const HOME_THEME_STORAGE_KEY = 'erpqalam_home_theme_preference';

export type HomeThemePreference = 'light' | 'dark' | 'system';
