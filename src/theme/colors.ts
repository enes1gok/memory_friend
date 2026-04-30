/** App color tokens — prefer these over one-off hex in components. */
export const colors = {
  canvas: '#07070f',
  /** @deprecated Use `canvas` — kept for gradual migration */
  background: '#07070f',
  surface: '#0f0f1a',
  surfaceElevated: '#151528',
  textPrimary: '#f5f5f5',
  textSecondary: '#c8c8d8',
  textMuted: '#8888a0',
  accentBlue: '#3b82f6',
  accentOrange: '#f97316',
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
} as const;

export type ColorName = keyof typeof colors;
