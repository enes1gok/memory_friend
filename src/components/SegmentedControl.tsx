import { useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Body } from '@/components/Typography';
import { colors } from '@/theme/colors';
import { springs } from '@/theme/motion';

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  value: T;
  options: SegmentedOption<T>[];
  onChange: (value: T) => void;
  testID?: string;
  disabled?: boolean;
};

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  testID,
  disabled,
}: Props<T>) {
  const [width, setWidth] = useState(0);
  const translateX = useSharedValue(0);
  const activeIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const itemWidth = width > 0 ? width / Math.max(1, options.length) : 0;

  useEffect(() => {
    translateX.value = withSpring(activeIndex * itemWidth, springs.gentle);
  }, [activeIndex, itemWidth, translateX]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const onLayout = useMemo(
    () => (event: LayoutChangeEvent) => {
      setWidth(event.nativeEvent.layout.width);
    },
    [],
  );

  return (
    <View
      testID={testID}
      onLayout={onLayout}
      className="rounded-pill border border-outline bg-surfaceContainerHighest p-xs"
      accessibilityRole="tablist"
    >
      {itemWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          className="absolute bottom-xs top-xs rounded-pill"
          style={[
            {
              width: itemWidth,
              backgroundColor: colors.secondaryContainer,
            },
            thumbStyle,
          ]}
        />
      ) : null}
      <View className="flex-row">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <AnimatedPressable
              key={option.value}
              testID={testID ? `${testID}:${option.value}` : undefined}
              disabled={disabled}
              haptic
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}
              className="flex-1 items-center justify-center rounded-pill py-sm"
              onPress={() => {
                if (option.value !== value) {
                  onChange(option.value);
                }
              }}
            >
              <Body
                className={`text-sm font-semibold ${selected ? 'text-onSecondaryContainer' : 'text-onSurfaceVariant'}`}
              >
                {option.label}
              </Body>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}
