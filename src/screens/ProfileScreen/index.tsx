import { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { AppCard } from '@/components/AppCard';
import { SafeScreen } from '@/components/SafeScreen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Body, Caption } from '@/components/Typography';
import { useAppLanguage } from '@/hooks/useAppLanguage';
import { nativeNameForLocale } from '@/i18n/appLocales';
import type { RootStackParamList } from '@/navigation/types';

export function ProfileScreen() {
  const { t } = useTranslation();
  const tabNavigation = useNavigation();
  const rootNavigation = tabNavigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const { current } = useAppLanguage();
  const currentLanguageLabel = nativeNameForLocale(current);

  const openLanguageSettings = useCallback(() => {
    rootNavigation?.navigate('LanguageSettings');
  }, [rootNavigation]);

  return (
    <SafeScreen testID="profile:screen:root">
      <View className="flex-1 px-4 pt-4">
        <ScreenHeader title={t('screens.profile.title')} subtitle={t('screens.profile.subtitle')} />

        <Caption className="mb-2 px-1 uppercase tracking-wide text-muted">
          {t('screens.profile.languageSection')}
        </Caption>
        <AppCard className="mb-4 p-0">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('settings.language.rowA11y', { language: currentLanguageLabel })}
            testID="profile:language:press"
            onPress={openLanguageSettings}
            className="flex-row items-center justify-between px-4 py-4 active:opacity-80"
          >
            <Body className="font-medium text-primary">{t('settings.language.rowLabel')}</Body>
            <Body className="text-muted">{currentLanguageLabel}</Body>
          </Pressable>
        </AppCard>

        <Caption className="px-1 text-center text-muted">memory_friend</Caption>
      </View>
    </SafeScreen>
  );
}
