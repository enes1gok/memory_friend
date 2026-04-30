import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

type Props = {
  children: ReactNode;
  className?: string;
  testID?: string;
} & Pick<ViewProps, 'accessibilityRole' | 'accessibilityLabel' | 'accessibilityState'>;

export function AppCard({
  children,
  className = '',
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
      className={`rounded-2xl border border-white/10 bg-surface/95 p-4 shadow-sm shadow-black/40 ${className}`}
    >
      {children}
    </View>
  );
}
