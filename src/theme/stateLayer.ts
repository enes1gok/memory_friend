/**
 * Material 3 style state layer opacities (dark theme, on-surface overlay).
 * In RN, prefer a child `View` with `backgroundColor: stateLayerOnSurface(opacity)` over the control.
 */
export const stateLayerOpacity = {
  hover: 0.08,
  focus: 0.12,
  pressed: 0.1,
  dragged: 0.16,
  selected: 0.12,
  disabledContainer: 0.12,
  disabledContent: 0.38,
} as const;

export function stateLayerOnSurface(opacity: number): string {
  return `rgba(255,255,255,${Math.min(1, Math.max(0, opacity))})`;
}
