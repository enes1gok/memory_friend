import type { ReactNode } from 'react';
import { Text, type PressableProps } from 'react-native';

import { AnimatedPressable } from '@/components/AnimatedPressable';
import { colors } from '@/theme/colors';
import { fontFamilies } from '@/theme/fonts';

type Props = PressableProps & {
  children: ReactNode;
  testID?: string;
};

export function SecondaryButton({
  children,
  testID,
  className = '',
  disabled,
  ...rest
}: Props) {
  return (
    <AnimatedPressable
      testID={testID}
      disabled={disabled}
      haptic
      className={`items-center justify-center rounded-lg border border-borderStrong bg-white/5 px-xl py-md ${disabled === true ? 'opacity-45' : ''} ${className}`}
      {...rest}
    >
      {typeof children === 'string' ? (
        <Text
          style={{
            fontFamily: fontFamilies.bodySemiBold,
            color: colors.textPrimary,
            fontSize: 16,
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
