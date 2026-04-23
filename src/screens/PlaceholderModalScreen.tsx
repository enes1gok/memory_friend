import { useLayoutEffect } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import { Body } from '@/components/Typography';
import { SafeScreen } from '@/components/SafeScreen';

export function PlaceholderModalScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('screens.placeholderModal.title'),
      headerBackTitle: t('tabs.profile'),
    });
  }, [navigation, t]);

  return (
    <SafeScreen testID="placeholderModal:screen:root">
      <View className="flex-1 justify-center px-6">
        <Body>{t('screens.placeholderModal.body')}</Body>
      </View>
    </SafeScreen>
  );
}
