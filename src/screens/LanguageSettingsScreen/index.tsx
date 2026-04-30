import { useLayoutEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import { Body } from '@/components/Typography';
import { SafeScreen } from '@/components/SafeScreen';
import { APP_LOCALES } from '@/i18n/appLocales';
import { useAppLanguage } from '@/hooks/useAppLanguage';
import { colors } from '@/theme/colors';
import { fontFamilies } from '@/theme/fonts';

export function LanguageSettingsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { current, setLanguage } = useAppLanguage();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('settings.language.screenTitle'),
      headerBackTitle: t('tabs.profile'),
    });
  }, [navigation, t]);

  return (
    <SafeScreen testID="languageSettings:screen:root">
      <View className="flex-1 px-4 pt-4">
        {APP_LOCALES.map((row) => {
          const selected = row.code === current;
          return (
            <Pressable
              key={row.code}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={row.nativeName}
              testID={`languageSettings:option:${row.code}`}
              onPress={() => {
                setLanguage(row.code);
              }}
              className="mb-2 flex-row items-center justify-between rounded-xl border border-white/10 bg-surface/80 px-4 py-4 active:opacity-80"
            >
              <Body className="text-base font-medium text-primary">{row.nativeName}</Body>
              {selected ? (
                <Text
                  style={{
                    color: colors.accentBlue,
                    fontFamily: fontFamilies.body,
                    fontSize: 18,
                    fontWeight: '600',
                  }}
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                >
                  ✓
                </Text>
              ) : (
                <View className="w-5" />
              )}
            </Pressable>
          );
        })}
      </View>
    </SafeScreen>
  );
}
