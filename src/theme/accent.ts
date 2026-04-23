import { colors } from './colors';

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const n = hex.replace('#', '');
  const bigint = parseInt(n, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

/** Interpolates ocean blue (goal far) to fiery orange (goal near) for `progress` in [0, 1]. */
export function getAccentColor(progress: number): string {
  const t = Math.min(1, Math.max(0, progress));
  const start = hexToRgb(colors.accentBlue);
  const end = hexToRgb(colors.accentOrange);
  const r = Math.round(start.r + (end.r - start.r) * t);
  const g = Math.round(start.g + (end.g - start.g) * t);
  const b = Math.round(start.b + (end.b - start.b) * t);
  return rgbToHex(r, g, b);
}
