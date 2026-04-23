import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Body, Heading } from '@/components/Typography';
import { SafeScreen } from '@/components/SafeScreen';

export function JournalScreen() {
  const { t } = useTranslation();

  return (
    <SafeScreen testID="journal:screen:root">
      <View className="flex-1 justify-center px-6">
        <Heading className="mb-2">{t('screens.journal.title')}</Heading>
        <Body>{t('screens.journal.placeholder')}</Body>
      </View>
    </SafeScreen>
  );
}
