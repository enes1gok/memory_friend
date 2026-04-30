import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { Easing, FadeInDown } from 'react-native-reanimated';

export const durations = {
  fast: 150,
  base: 220,
  slow: 320,
  stagger: 60,
} as const;

export const motionEasing = {
  standard: Easing.out(Easing.cubic),
  emphasized: Easing.bezier(0.2, 0, 0, 1),
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
