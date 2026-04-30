import { useDatabase } from '@nozbe/watermelondb/react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Body, Caption, Heading } from '@/components/Typography';
import { SafeScreen } from '@/components/SafeScreen';
import { ensureChannels } from '@/features/notification/channels';
import { useNotificationPermission } from '@/features/notification/hooks/useNotificationPermission';
import { getPreferredReminderHour, scheduleOrReschedule } from '@/features/notification/logic/scheduleDaily';
import type { Goal } from '@/models/Goal';
import type { OnboardingStackParamList } from '@/navigation/types';
import { useGoalStore } from '@/stores/useGoalStore';
import { hapticSuccess } from '@/utils/haptics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingStart'>;

export function StartScreen({ route }: Props) {
  const { t } = useTranslation();
  const database = useDatabase();
  const navigation = useNavigation();
  const setActiveGoalId = useGoalStore((s) => s.setActiveGoalId);
  const { request: requestNotificationPermission } = useNotificationPermission();
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
      try {
        await ensureChannels();
        await requestNotificationPermission();
        await scheduleOrReschedule({
          goalId: newGoal.id,
          goalTitle: newGoal.title,
          targetDate: newGoal.targetDate,
          reminderHour: getPreferredReminderHour(),
          streakCount: 0,
        });
      } catch (notifErr) {
        console.warn('[StartScreen] notification setup', notifErr);
      }
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
        <Caption className="mb-6 text-center text-muted">
          {t('onboarding.step.label', { current: 3, total: 3 })}
        </Caption>
        <Heading className="mb-2">{t('onboarding.start.title')}</Heading>
        <Body className="mb-8 text-muted">{t('onboarding.start.subtitle')}</Body>

        <View className="mb-10 rounded-2xl border border-white/15 bg-surfaceElevated/90 p-6">
          <Caption className="mb-2 text-xs uppercase tracking-wide text-muted">
            {t('onboarding.start.summaryGoal')}
          </Caption>
          <Heading className="mb-6 text-xl">{goalTitle}</Heading>
          <Caption className="mb-2 text-xs uppercase tracking-wide text-muted">
            {t('onboarding.start.summaryDate')}
          </Caption>
          <Body className="text-lg text-primary">{targetDate.toLocaleDateString()}</Body>
        </View>

        <PrimaryButton
          variant="orange"
          testID="onboarding:start:cta"
          onPress={onStart}
          disabled={busy}
          loading={busy}
          accessibilityLabel={t('onboarding.start.cta')}
        >
          {t('onboarding.start.cta')}
        </PrimaryButton>
      </View>
    </SafeScreen>
  );
}
