import { View } from 'react-native';
import Animated, { Layout } from 'react-native-reanimated';

import { colors } from '@/theme/colors';

type Props = {
  current: number;
  total: number;
  accessibilityLabel?: string;
};

export function StepDots({ current, total, accessibilityLabel }: Props) {
  return (
    <View
      className="flex-row justify-center"
      style={{ gap: 8 }}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
    >
      {Array.from({ length: total }, (_, index) => {
        const active = index + 1 === current;
        return (
          <Animated.View
            key={index}
            layout={Layout.springify().damping(18)}
            style={{
              width: active ? 28 : 8,
              height: 8,
              borderRadius: 999,
              backgroundColor: active ? colors.accentOrange : colors.borderStrong,
            }}
          />
        );
      })}
    </View>
  );
}
