import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { View } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { AnimatedPressable } from '@/components/AnimatedPressable';
import { AppCard } from '@/components/AppCard';
import { GradientCard } from '@/components/GradientCard';
import { SafeScreen } from '@/components/SafeScreen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Body, Caption, Heading } from '@/components/Typography';
import { useActiveGoal } from '@/features/streak';
import { useAppLanguage } from '@/hooks/useAppLanguage';
import { nativeNameForLocale } from '@/i18n/appLocales';
import type { RootStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';

export function ProfileScreen() {
  const { t } = useTranslation();
  const tabNavigation = useNavigation();
  const rootNavigation = tabNavigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const { current } = useAppLanguage();
  const goal = useActiveGoal();
  const currentLanguageLabel = nativeNameForLocale(current);

  const openLanguageSettings = useCallback(() => {
    rootNavigation?.navigate('LanguageSettings');
  }, [rootNavigation]);

  const memberSince = goal ? goal.startDate.toLocaleDateString() : t('screens.profile.notStarted');

  return (
    <SafeScreen testID="profile:screen:root">
      <View className="flex-1 px-4 pt-4">
        <ScreenHeader title={t('screens.profile.title')} subtitle={t('screens.profile.subtitle')} />

        <GradientCard className="mb-4" contentStyle={{ padding: 18 }}>
          <View className="flex-row items-center gap-3">
            <View className="h-14 w-14 items-center justify-center rounded-pill bg-white/10">
              <Heading className="text-2xl">M</Heading>
            </View>
            <View className="flex-1">
              <Heading className="text-xl">{t('screens.profile.headerTitle')}</Heading>
              <Caption className="text-muted">
                {t('screens.profile.memberSince', { date: memberSince })}
              </Caption>
            </View>
          </View>
        </GradientCard>

        <Caption className="mb-2 px-1 uppercase tracking-wide text-muted">
          {t('screens.profile.goalSection')}
        </Caption>
        <AppCard className="mb-4">
          <Body className="font-semibold text-primary">
            {goal ? goal.title : t('screens.profile.noGoal')}
          </Body>
          <Caption className="mt-1 text-muted">
            {goal ? goal.targetDate.toLocaleDateString() : t('screens.profile.noGoalHint')}
          </Caption>
        </AppCard>

        <Caption className="mb-2 px-1 uppercase tracking-wide text-muted">
          {t('screens.profile.languageSection')}
        </Caption>
        <AppCard className="mb-4 p-0">
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel={t('settings.language.rowA11y', { language: currentLanguageLabel })}
            testID="profile:language:press"
            onPress={openLanguageSettings}
            haptic
            className="flex-row items-center justify-between px-4 py-4 active:opacity-80"
          >
            <Body className="font-medium text-primary">{t('settings.language.rowLabel')}</Body>
            <View className="flex-row items-center gap-2">
              <Body className="text-muted">{currentLanguageLabel}</Body>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </View>
          </AnimatedPressable>
        </AppCard>

        <GradientCard className="mb-4" colors={[`${colors.accentOrange}44`, `${colors.accentBlue}22`, colors.surfaceContainer]}>
          <Heading className="mb-1 text-lg">{t('screens.profile.proTitle')}</Heading>
          <Body className="text-sm text-secondary">{t('screens.profile.proBody')}</Body>
        </GradientCard>

        <Caption className="px-1 text-center text-muted">{t('screens.profile.footer')}</Caption>
      </View>
    </SafeScreen>
  );
}
