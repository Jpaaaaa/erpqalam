/** Matches apps/web tailwind.config.ts brand-gradient. */
export const BRAND_GRADIENT = ['#2ec4b6', '#7dd3c0', '#ffb088'] as const;

export const brandShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.06,
  shadowRadius: 30,
  elevation: 4,
} as const;

export const cardShadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.05,
  shadowRadius: 20,
  elevation: 3,
} as const;
