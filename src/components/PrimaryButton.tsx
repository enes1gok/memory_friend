import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

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
  testID?: string;
};

export function PrimaryButton({
  children,
  loading = false,
  variant = 'accent',
  disabled,
  testID,
  className = '',
  style,
  ...rest
}: Props) {
  const isDisabled = disabled === true || loading;
  const fillColor = variant === 'orange' ? colors.accentOrange : colors.accentBlue;

  return (
    <Pressable
      testID={testID}
      disabled={isDisabled}
      style={(state) => {
        const base: StyleProp<ViewStyle>[] = [
          styles.pressableBase,
          { backgroundColor: fillColor },
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
      {loading ? (
        <ActivityIndicator color={colors.textPrimary} />
      ) : typeof children === 'string' ? (
        <ButtonText className="text-primary">{children}</ButtonText>
      ) : (
        children
      )}
    </Pressable>
  );
}
