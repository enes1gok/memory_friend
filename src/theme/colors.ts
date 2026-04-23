export const colors = {
  background: '#07070f',
  surface: '#0f0f1a',
  textPrimary: '#f5f5f5',
  textMuted: '#8888a0',
  accentBlue: '#3b82f6',
  accentOrange: '#f97316',
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
} as const;

export type ColorName = keyof typeof colors;
