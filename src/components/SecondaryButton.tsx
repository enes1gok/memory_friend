import type { ReactNode } from 'react';
import { StyleSheet, Text, type PressableProps } from 'react-native';

import { AnimatedPressable } from '@/components/AnimatedPressable';
import { colors } from '@/theme/colors';
import { fontFamilies } from '@/theme/fonts';
import { radius } from '@/theme/radius';

const styles = StyleSheet.create({
  root: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

type Props = PressableProps & {
  children: ReactNode;
  testID?: string;
};

export function SecondaryButton({ children, testID, className = '', disabled, ...rest }: Props) {
  return (
    <AnimatedPressable
      testID={testID}
      disabled={disabled}
      haptic
      style={[styles.root, disabled === true ? { opacity: 0.45 } : null]}
      className={`items-center justify-center ${className}`}
      {...rest}
    >
      {typeof children === 'string' ? (
        <Text
          style={{
            fontFamily: fontFamilies.bodySemiBold,
            color: colors.onSurface,
            fontSize: 14,
            lineHeight: 20,
            letterSpacing: 0.1,
            textAlign: 'center',
          }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </AnimatedPressable>
  );
}
