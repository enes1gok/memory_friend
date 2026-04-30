import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { colors } from '@/theme/colors';

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: colors.surface,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
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
      className={`rounded-2xl border border-white/10 bg-surface/95 p-4 shadow-sm shadow-black/40 ${className}`}
    >
      {children}
    </View>
  );
}
