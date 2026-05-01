import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { Easing, FadeInDown } from 'react-native-reanimated';

/** Durations aligned with M3-ish roles: quick / standard / emphasized */
export const durations = {
  quick: 100,
  fast: 150,
  base: 220,
  slow: 320,
  stagger: 60,
} as const;

export const motionEasing = {
  standard: Easing.out(Easing.cubic),
  emphasized: Easing.bezier(0.2, 0, 0, 1),
  emphasizedDecelerate: Easing.bezier(0.05, 0.7, 0.1, 1),
} as const;

/** Spring presets for tabs, chips, layout */
export const springs = {
  gentle: { damping: 20, stiffness: 260 },
  tab: { damping: 18, stiffness: 220 },
  expressive: { damping: 14, stiffness: 200 },
} as const;

export function enterAnimation(index = 0) {
  return FadeInDown.delay(index * durations.stagger)
    .duration(durations.base)
    .easing(motionEasing.standard);
}

export function useReduceMotionPreference(): boolean {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) {
        setReduceMotion(enabled);
      }
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return reduceMotion;
}
