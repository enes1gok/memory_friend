import type { ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { hapticSelection } from '@/utils/haptics';
import { springs, useReduceMotionPreference } from '@/theme/motion';

const AnimatedContainer = Animated.createAnimatedComponent(Pressable);

type Props = PressableProps & {
  children: ReactNode;
  haptic?: boolean;
};

export function AnimatedPressable({
  children,
  disabled,
  haptic = false,
  onPress,
  onPressIn,
  onPressOut,
  style,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const reduceMotion = useReduceMotionPreference();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedContainer
      disabled={disabled}
      onPress={(event) => {
        if (haptic && disabled !== true) {
          hapticSelection();
        }
        onPress?.(event);
      }}
      onPressIn={(event) => {
        scale.value = reduceMotion ? 1 : withSpring(0.97, springs.gentle);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, springs.gentle);
        onPressOut?.(event);
      }}
      style={(state) => [
        animatedStyle,
        disabled === true ? { opacity: 0.45 } : null,
        typeof style === 'function' ? style(state) : style,
      ]}
      hitSlop={rest.hitSlop ?? 8}
      {...rest}
    >
      {children}
    </AnimatedContainer>
  );
}
