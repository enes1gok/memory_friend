import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';

import { ButtonText } from '@/components/Typography';
import { colors } from '@/theme/colors';

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
  ...rest
}: Props) {
  const bgClass =
    variant === 'orange' ? 'bg-accentOrange active:opacity-90' : 'bg-accentBlue active:opacity-90';
  const isDisabled = disabled === true || loading;

  return (
    <Pressable
      testID={testID}
      disabled={isDisabled}
      className={`items-center justify-center rounded-2xl py-3.5 px-5 ${bgClass} ${isDisabled ? 'opacity-45' : ''} ${className}`}
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
