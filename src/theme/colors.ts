/**
 * Semantic color tokens (Material 3 inspired dark scheme).
 * Legacy keys (`surface`, `surfaceElevated`, `textPrimary`, …) remain for gradual migration.
 */
export const colors = {
  // Canvas / window background
  canvas: '#0c0c1e',

  /** @deprecated Use `canvas` */
  background: '#0c0c1e',

  // M3 surface roles (dark, low to high emphasis)
  /** Default app / sheet surface */
  surface: '#161630',
  surfaceContainerLow: '#12122a',
  surfaceContainer: '#161630',
  surfaceContainerHigh: '#1e1e3a',
  surfaceContainerHighest: '#262648',

  /** Same as `surfaceContainerHigh`; kept for existing imports */
  surfaceElevated: '#1e1e3a',

  // On-surface text
  onSurface: '#f5f5f5',
  onSurfaceVariant: '#c8c8d8',
  /** @deprecated Use `onSurface` */
  textPrimary: '#f5f5f5',
  /** @deprecated Use `onSurfaceVariant` */
  textSecondary: '#c8c8d8',
  textMuted: '#8888a0',

  // Primary (static seed; dynamic accent from journey uses `getAccentColor` in UI)
  primary: '#3b82f6',
  onPrimary: '#ffffff',
  primaryContainer: '#1e3a5c',
  onPrimaryContainer: '#dbeafe',

  secondaryContainer: '#2a2a48',
  onSecondaryContainer: '#e8e8f0',

  outline: 'rgba(255,255,255,0.12)',
  outlineVariant: 'rgba(255,255,255,0.08)',

  borderSubtle: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.16)',

  overlay: 'rgba(0,0,0,0.55)',
  overlayStrong: 'rgba(0,0,0,0.72)',

  accentBlue: '#3b82f6',
  accentOrange: '#f97316',
  accentRed: '#dc2626',

  success: '#22c55e',
  onSuccess: '#052e16',
  warning: '#eab308',
  onWarning: '#1a1500',
  error: '#ef4444',
  onError: '#ffffff',
} as const;

export type ColorName = keyof typeof colors;
