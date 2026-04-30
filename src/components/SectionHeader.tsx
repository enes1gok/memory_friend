import { View } from 'react-native';

import { Body, Heading } from '@/components/Typography';

type Props = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function SectionHeader({ title, subtitle, className = '' }: Props) {
  return (
    <View className={`mb-3 ${className}`}>
      <Heading className="text-lg">{title}</Heading>
      {subtitle ? (
        <Body className="mt-0.5 text-sm text-muted">{subtitle}</Body>
      ) : null}
    </View>
  );
}
