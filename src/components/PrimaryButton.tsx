import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  View,
} from 'react-native';

import { AnimatedPressable } from '@/components/AnimatedPressable';
import { ButtonText } from '@/components/Typography';
import { useUIStore } from '@/stores/useUIStore';
import { getAccentColor } from '@/theme/accent';
import { colors } from '@/theme/colors';
import { fontFamilies } from '@/theme/fonts';
import { radius } from '@/theme/radius';

const styles = StyleSheet.create({
  pressableBase: {
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    minHeight: 48,
  },
  pressed: {
    opacity: 0.88,
  },
  disabled: {
    opacity: 0.45,
  },
});

export type PrimaryButtonAppearance = 'filled' | 'tonal' | 'outlined' | 'text';

type Props = PressableProps & {
  children: ReactNode;
  loading?: boolean;
  variant?: 'accent' | 'orange';
  gradient?: boolean;
  /** Material 3 style; `filled` keeps current gradient / solid brand behavior */
  appearance?: PrimaryButtonAppearance;
  leadingIcon?: ReactNode;
  testID?: string;
  /** NativeWind layout classes; applied on a wrapper `View` (not on `AnimatedPressable`) for css-interop compatibility */
  className?: string;
};

export function PrimaryButton({
  children,
  loading = false,
  variant = 'accent',
  gradient = false,
  appearance = 'filled',
  leadingIcon,
  disabled,
  testID,
  className,
  style,
  ...rest
}: Props) {
  const isDisabled = disabled === true || loading;
  const accentProgress = useUIStore((s) => s.accentProgress);
  const dynamicAccent = useMemo(() => getAccentColor(accentProgress), [accentProgress]);
  const fillColor = variant === 'orange' ? colors.accentOrange : dynamicAccent;

  const labelColor =
    appearance === 'tonal'
      ? colors.onPrimaryContainer
      : appearance === 'outlined' || appearance === 'text'
        ? colors.onSurface
        : colors.onPrimary;

  const resolvedStyle = (state: { pressed: boolean }): StyleProp<ViewStyle> => {
    const base: StyleProp<ViewStyle>[] = [styles.pressableBase];

    if (appearance === 'outlined') {
      base.push({
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.outline,
      });
    } else if (appearance === 'text') {
      base.push({ backgroundColor: 'transparent' });
    } else if (appearance === 'tonal') {
      base.push({ backgroundColor: colors.primaryContainer, overflow: 'hidden' });
    } else if (gradient) {
      base.push({ overflow: 'hidden', backgroundColor: fillColor });
    } else {
      base.push({ backgroundColor: fillColor });
    }

    base.push(state.pressed && !isDisabled ? styles.pressed : null);
    base.push(isDisabled ? styles.disabled : null);

    if (style == null) {
      return base;
    }
    return [...base, typeof style === 'function' ? style(state) : style];
  };

  const showGradient = appearance === 'filled' && gradient;

  const pressable = (
    <AnimatedPressable
      testID={testID}
      disabled={isDisabled}
      haptic
      style={resolvedStyle}
      {...rest}
    >
      {showGradient ? (
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
        <ActivityIndicator color={labelColor} />
      ) : typeof children === 'string' ? (
        <View className="z-10 flex-row items-center justify-center" style={{ gap: 8 }}>
          {leadingIcon}
          {appearance === 'filled' ? (
            <ButtonText>{children}</ButtonText>
          ) : (
            <Text
              style={{
                fontFamily: fontFamilies.bodySemiBold,
                color: labelColor,
                fontSize: 14,
                lineHeight: 20,
                letterSpacing: 0.1,
              }}
            >
              {children}
            </Text>
          )}
        </View>
      ) : (
        children
      )}
    </AnimatedPressable>
  );

  if (className != null && className.trim().length > 0) {
    return (
      <View className={className} style={{ width: '100%' }}>
        {pressable}
      </View>
    );
  }

  return pressable;
}

PrimaryButton.displayName = 'PrimaryButton';

export default PrimaryButton;
