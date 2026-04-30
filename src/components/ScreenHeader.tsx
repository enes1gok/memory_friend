import { View } from 'react-native';

import { Body, Display } from '@/components/Typography';

type Props = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function ScreenHeader({ title, subtitle, className = '' }: Props) {
  return (
    <View className={`mb-6 px-1 ${className}`}>
      <Display className="mb-1">{title}</Display>
      {subtitle ? <Body className="text-secondary">{subtitle}</Body> : null}
    </View>
  );
}
