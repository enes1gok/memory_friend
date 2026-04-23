import { useDatabase } from '@nozbe/watermelondb/react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Body, Heading } from '@/components/Typography';
import { SafeScreen } from '@/components/SafeScreen';
import type { Goal } from '@/models/Goal';
import type { OnboardingStackParamList } from '@/navigation/types';
import { useGoalStore } from '@/stores/useGoalStore';
import { colors } from '@/theme/colors';
import { hapticSuccess } from '@/utils/haptics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingStart'>;

export function StartScreen({ route }: Props) {
  const { t } = useTranslation();
  const database = useDatabase();
  const navigation = useNavigation();
  const setActiveGoalId = useGoalStore((s) => s.setActiveGoalId);
  const [busy, setBusy] = useState(false);

  const { goalTitle, targetDateIso } = route.params;
  const targetDate = new Date(targetDateIso);

  async function onStart() {
    if (busy) return;
    setBusy(true);
    try {
      const newGoal = await database.write(async () => {
        return database.get<Goal>('goals').create((goal) => {
          goal.title = goalTitle;
          goal.targetDate = targetDate;
          goal.startDate = new Date();
          goal.isCompleted = false;
        });
      });
      setActiveGoalId(newGoal.id);
      hapticSuccess();
      navigation.getParent()?.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        }),
      );
    } catch (e) {
      console.error('[StartScreen] Failed to create goal', e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeScreen testID="onboarding:start:root">
      <View className="flex-1 justify-center px-6">
        <Heading className="mb-2">{t('onboarding.start.title')}</Heading>
        <Body className="mb-8 text-slate-400">{t('onboarding.start.subtitle')}</Body>

        <View className="mb-10 rounded-2xl border border-slate-700 bg-slate-900/80 p-6">
          <Body className="mb-2 text-xs uppercase tracking-wide text-slate-500">
            {t('onboarding.start.summaryGoal')}
          </Body>
          <Heading className="mb-6 text-xl">{goalTitle}</Heading>
          <Body className="mb-2 text-xs uppercase tracking-wide text-slate-500">
            {t('onboarding.start.summaryDate')}
          </Body>
          <Body className="text-lg text-white">{targetDate.toLocaleDateString()}</Body>
        </View>

        <Pressable
          testID="onboarding:start:cta"
          onPress={onStart}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.start.cta')}
          className="items-center rounded-xl bg-orange-500 py-4"
        >
          {busy ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <Body className="font-semibold text-white">{t('onboarding.start.cta')}</Body>
          )}
        </Pressable>
      </View>
    </SafeScreen>
  );
}
