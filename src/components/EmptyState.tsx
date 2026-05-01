import { View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Body, Heading } from '@/components/Typography';

type Props = {
  title: string;
  body: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  testID?: string;
};

export function EmptyState({ title, body, ctaLabel, onCtaPress, testID }: Props) {
  return (
    <View
      testID={testID}
      className="flex-1 justify-center px-6"
      accessibilityRole="none"
    >
      <Heading className="mb-2 text-center text-xl text-onSurface">{title}</Heading>
      <Body className="mb-8 text-center text-onSurfaceVariant">{body}</Body>
      {ctaLabel != null && onCtaPress != null ? (
        <PrimaryButton testID={`${testID}:cta`} onPress={onCtaPress}>
          {ctaLabel}
        </PrimaryButton>
      ) : null}
    </View>
  );
}
