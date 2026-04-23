import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Body, Heading } from '@/components/Typography';
import { SafeScreen } from '@/components/SafeScreen';

export function CaptureScreen() {
  const { t } = useTranslation();

  return (
    <SafeScreen testID="capture:screen:root">
      <View className="flex-1 justify-center px-6">
        <Heading className="mb-2">{t('screens.capture.title')}</Heading>
        <Body>{t('screens.capture.placeholder')}</Body>
      </View>
    </SafeScreen>
  );
}
