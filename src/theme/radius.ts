/** Shared corner radii (Material 3 inspired shape scale). */
export const radius = {
  /** Extra-small: chips, dense controls */
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  /** Expressive large surfaces, sheets */
  '3xl': 28,
  pill: 999,
} as const;

export type RadiusName = keyof typeof radius;
