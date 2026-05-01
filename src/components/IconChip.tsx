import type { ComponentProps, ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Caption } from '@/components/Typography';
import { colors } from '@/theme/colors';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  icon?: IconName;
  emoji?: string;
  label: string;
  tone?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export function IconChip({ icon, emoji, label, tone = colors.accentBlue, children, style, testID }: Props) {
  return (
    <View
      testID={testID}
      className="flex-row items-center rounded-pill border border-outline bg-secondaryContainer px-md py-xs"
      style={[{ gap: 6 }, style]}
    >
      {icon ? <Ionicons name={icon} size={14} color={tone} /> : null}
      {emoji ? <Caption className="text-sm">{emoji}</Caption> : null}
      {children ?? <Caption className="text-xs text-onSurfaceVariant">{label}</Caption>}
    </View>
  );
}
