import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { colors } from '@/theme/colors';
import { elevation } from '@/theme/elevation';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

export type AppCardVariant = 'elevated' | 'outlined' | 'filled';

const variantStyles = StyleSheet.create({
  elevated: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainer,
    padding: spacing.lg,
    ...elevation.raised,
  },
  outlined: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: 'transparent',
    padding: spacing.lg,
    ...elevation.flat,
  },
  filled: {
    borderRadius: radius.xl,
    borderWidth: 0,
    backgroundColor: colors.surfaceContainerHigh,
    padding: spacing.lg,
    ...elevation.flat,
  },
});

type Props = {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  variant?: AppCardVariant;
} & Pick<ViewProps, 'accessibilityRole' | 'accessibilityLabel' | 'accessibilityState'>;

export function AppCard({
  children,
  className = '',
  style,
  testID,
  variant = 'elevated',
  accessibilityRole,
  accessibilityLabel,
  accessibilityState,
}: Props) {
  const base = variantStyles[variant];

  return (
    <View
      testID={testID}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      style={[base, style]}
      className={className}
    >
      {children}
    </View>
  );
}
