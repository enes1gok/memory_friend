import type { ReactNode } from 'react';
import { Pressable, Text, type PressableProps } from 'react-native';

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
    <Pressable
      testID={testID}
      disabled={disabled}
      className={`items-center justify-center rounded-2xl border border-white/15 bg-white/5 py-3.5 px-5 active:bg-white/10 ${disabled === true ? 'opacity-45' : ''} ${className}`}
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
    </Pressable>
  );
}
