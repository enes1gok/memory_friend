import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { colors } from '@/theme/colors';
import { elevation } from '@/theme/elevation';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    ...elevation.raised,
  },
});

type Props = {
  children: ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
} & Pick<ViewProps, 'accessibilityRole' | 'accessibilityLabel' | 'accessibilityState'>;

export function AppCard({
  children,
  className = '',
  style,
  testID,
  accessibilityRole,
  accessibilityLabel,
  accessibilityState,
}: Props) {
  return (
    <View
      testID={testID}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={accessibilityState}
      style={[styles.base, style]}
      className={`rounded-lg border border-borderSubtle bg-surface/95 p-lg ${className}`}
    >
      {children}
    </View>
  );
}
