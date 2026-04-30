import type { ComponentProps, ReactNode } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Caption, Display } from '@/components/Typography';
import { colors } from '@/theme/colors';

type Props = {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: ReactNode;
  footnote: string;
  accent?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function StatCard({
  icon,
  label,
  value,
  footnote,
  accent = colors.accentBlue,
  style,
  accessibilityLabel,
}: Props) {
  return (
    <View
      className="flex-1 rounded-lg border border-borderSubtle bg-white/5 px-md py-md"
      style={style}
      accessibilityLabel={accessibilityLabel}
    >
      <View className="mb-xs">
        <Ionicons name={icon} size={18} color={accent} />
      </View>
      <Caption className="mb-0.5 text-[10px] uppercase tracking-wider text-muted">{label}</Caption>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Display className="text-2xl leading-8">{value}</Display>
      ) : (
        value
      )}
      <Caption className="text-[11px] text-muted" numberOfLines={2}>
        {footnote}
      </Caption>
    </View>
  );
}
