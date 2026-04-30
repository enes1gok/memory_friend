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
  borderSubtle: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.16)',
  overlay: 'rgba(0,0,0,0.55)',
  overlayStrong: 'rgba(0,0,0,0.72)',
  accentBlue: '#3b82f6',
  accentOrange: '#f97316',
  accentRed: '#dc2626',
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
} as const;

export type ColorName = keyof typeof colors;
