import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';

type Props = {
  variant?: 'line' | 'block' | 'circle';
  width?: ViewStyle['width'];
  height?: ViewStyle['height'];
  style?: ViewStyle;
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainerHigh,
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
  },
});

export function Skeleton({ variant = 'line', width = '100%', height, style }: Props) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const size = variant === 'circle' ? 44 : height ?? (variant === 'line' ? 16 : 88);

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.base,
        {
          width,
          height: size,
          borderRadius: variant === 'circle' ? radius.pill : radius.md,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, animatedStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.12)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}
