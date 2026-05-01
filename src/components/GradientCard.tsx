import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppCard } from '@/components/AppCard';
import { colors } from '@/theme/colors';

type Props = {
  children: ReactNode;
  colors?: [string, string, ...string[]];
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  className?: string;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityRole?: 'summary' | 'button' | 'none';
};

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: 16,
  },
});

export function GradientCard({
  children,
  colors: gradientColors = ['rgba(59,130,246,0.18)', 'rgba(249,115,22,0.08)', colors.surfaceContainer],
  style,
  contentStyle,
  className = '',
  testID,
  accessibilityLabel,
  accessibilityRole,
}: Props) {
  return (
    <AppCard
      testID={testID}
      className={`p-0 ${className}`}
      style={[styles.card, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
    >
      <LinearGradient colors={gradientColors} style={styles.gradient} />
      <View style={[styles.content, contentStyle]}>{children}</View>
    </AppCard>
  );
}
