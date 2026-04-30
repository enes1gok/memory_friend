import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  View,
} from 'react-native';

import { AnimatedPressable } from '@/components/AnimatedPressable';
import { ButtonText } from '@/components/Typography';
import { colors } from '@/theme/colors';

const styles = StyleSheet.create({
  pressableBase: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    minHeight: 52,
  },
  pressed: {
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.45,
  },
});

type Props = PressableProps & {
  children: ReactNode;
  loading?: boolean;
  variant?: 'accent' | 'orange';
  gradient?: boolean;
  leadingIcon?: ReactNode;
  testID?: string;
};

export function PrimaryButton({
  children,
  loading = false,
  variant = 'accent',
  gradient = false,
  leadingIcon,
  disabled,
  testID,
  className = '',
  style,
  ...rest
}: Props) {
  const isDisabled = disabled === true || loading;
  const fillColor = variant === 'orange' ? colors.accentOrange : colors.accentBlue;

  return (
    <AnimatedPressable
      testID={testID}
      disabled={isDisabled}
      haptic
      style={(state) => {
        const base: StyleProp<ViewStyle>[] = [
          styles.pressableBase,
          gradient ? { overflow: 'hidden', backgroundColor: fillColor } : { backgroundColor: fillColor },
          state.pressed && !isDisabled ? styles.pressed : null,
          isDisabled ? styles.disabled : null,
        ];
        if (style == null) {
          return base;
        }
        return [...base, typeof style === 'function' ? style(state) : style];
      }}
      className={`items-center justify-center ${className}`}
      {...rest}
    >
      {gradient ? (
        <LinearGradient
          colors={
            variant === 'orange'
              ? [colors.accentOrange, colors.accentRed]
              : [colors.accentBlue, colors.accentOrange]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {loading ? (
        <ActivityIndicator color={colors.textPrimary} />
      ) : typeof children === 'string' ? (
        <View className="flex-row items-center justify-center" style={{ gap: 8 }}>
          {leadingIcon}
          <ButtonText className="text-primary">{children}</ButtonText>
        </View>
      ) : (
        children
      )}
    </AnimatedPressable>
  );
}
