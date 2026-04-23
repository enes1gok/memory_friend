/**
 * Central MMKV key registry. Values here should be rebuildable from WatermelonDB + files if wiped.
 * Document `logout` vs `device` scope when adding keys in later phases.
 */
export const MMKV_KEYS = {
  lastAppOpenAt: 'session:lastAppOpenAt',
} as const;
