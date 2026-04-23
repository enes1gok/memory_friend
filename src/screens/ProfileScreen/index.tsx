import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { Body, Heading } from '@/components/Typography';
import { SafeScreen } from '@/components/SafeScreen';
import { colors } from '@/theme/colors';
import { fontFamilies } from '@/theme/fonts';

export function ProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const openModal = useCallback(() => {
    navigation.navigate('PlaceholderModal');
  }, [navigation]);

  return (
    <SafeScreen testID="profile:screen:root">
      <View className="flex-1 justify-center px-6">
        <Heading className="mb-2">{t('screens.profile.title')}</Heading>
        <Body className="mb-6">{t('screens.profile.placeholder')}</Body>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('screens.profile.openModal')}
          testID="profile:open-modal:press"
          onPress={openModal}
          className="rounded-xl bg-accentBlue px-4 py-3 active:opacity-80"
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontFamily: fontFamilies.body,
              fontSize: 16,
              textAlign: 'center',
            }}
          >
            {t('screens.profile.openModal')}
          </Text>
        </Pressable>
      </View>
    </SafeScreen>
  );
}
