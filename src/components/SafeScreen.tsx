import type { ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';

interface SafeScreenProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function SafeScreen({ children, style, testID }: SafeScreenProps) {
  return (
    <SafeAreaView
      testID={testID}
      edges={['top', 'right', 'bottom', 'left']}
      style={[{ flex: 1, backgroundColor: colors.background }, style]}
    >
      {children}
    </SafeAreaView>
  );
}
