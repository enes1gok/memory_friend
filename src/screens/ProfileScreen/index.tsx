import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { Body, Heading } from '@/components/Typography';
import { SafeScreen } from '@/components/SafeScreen';
import { useAppLanguage } from '@/hooks/useAppLanguage';
import { nativeNameForLocale } from '@/i18n/appLocales';
import type { RootStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { fontFamilies } from '@/theme/fonts';

export function ProfileScreen() {
  const { t } = useTranslation();
  const tabNavigation = useNavigation();
  const rootNavigation = tabNavigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const { current } = useAppLanguage();
  const currentLanguageLabel = nativeNameForLocale(current);

  const openLanguageSettings = useCallback(() => {
    rootNavigation?.navigate('LanguageSettings');
  }, [rootNavigation]);

  const openModal = useCallback(() => {
    tabNavigation.navigate('PlaceholderModal');
  }, [tabNavigation]);

  return (
    <SafeScreen testID="profile:screen:root">
      <View className="flex-1 justify-center px-6">
        <Heading className="mb-2">{t('screens.profile.title')}</Heading>
        <Body className="mb-6">{t('screens.profile.placeholder')}</Body>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('settings.language.rowA11y', { language: currentLanguageLabel })}
          testID="profile:language:press"
          onPress={openLanguageSettings}
          className="mb-3 flex-row items-center justify-between rounded-xl border border-white/10 bg-surface/80 px-4 py-4 active:opacity-80"
        >
          <Body className="font-medium text-slate-100">{t('settings.language.rowLabel')}</Body>
          <Body className="text-slate-400">{currentLanguageLabel}</Body>
        </Pressable>

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
