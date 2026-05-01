import type { ViewStyle } from 'react-native';

/**
 * Depth on dark UI: prefer tonal surfaces; shadows stay subtle so panels do not look muddy.
 */
export const elevation = {
  flat: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  raised: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 8,
  },
} satisfies Record<string, ViewStyle>;

export type ElevationName = keyof typeof elevation;
