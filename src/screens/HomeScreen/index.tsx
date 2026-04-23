import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { Body, Heading } from '@/components/Typography';
import { SafeScreen } from '@/components/SafeScreen';
import {
  BadgeRow,
  EmotionHeatmap,
  StreakCounter,
  useActiveGoal,
} from '@/features/streak';
import { useGoalStore } from '@/stores/useGoalStore';

function daysUntilTargetEnd(target: Date): number {
  const end = new Date(target);
  end.setHours(23, 59, 59, 999);
  const ms = end.getTime() - Date.now();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

export function HomeScreen() {
  const { t } = useTranslation();
  const activeGoalId = useGoalStore((s) => s.activeGoalId);
  const goal = useActiveGoal();

  if (!activeGoalId) {
    return (
      <SafeScreen testID="home:screen:root">
        <View className="flex-1 justify-center px-6">
          <Heading className="mb-2">{t('home.noGoal.title')}</Heading>
          <Body className="text-slate-400">{t('home.noGoal.body')}</Body>
        </View>
      </SafeScreen>
    );
  }

  if (goal === undefined) {
    return (
      <SafeScreen testID="home:screen:root">
        <View className="flex-1 justify-center px-6">
          <Body className="text-slate-400">{t('common.loading')}</Body>
        </View>
      </SafeScreen>
    );
  }

  if (goal === null) {
    return (
      <SafeScreen testID="home:screen:root">
        <View className="flex-1 justify-center px-6">
          <Heading className="mb-2">{t('home.missingGoal.title')}</Heading>
          <Body className="text-slate-400">{t('home.missingGoal.body')}</Body>
        </View>
      </SafeScreen>
    );
  }

  const daysLeft = daysUntilTargetEnd(goal.targetDate);

  return (
    <SafeScreen testID="home:screen:root">
      <ScrollView
        className="flex-1 px-4 pt-2"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Heading className="mb-1 px-2 text-2xl" accessibilityRole="header">
          {goal.title}
        </Heading>
        <Body className="mb-4 px-2 text-slate-400">
          {daysLeft <= 0
            ? t('home.targetDay')
            : t('home.daysLeft', { count: Math.max(1, daysLeft) })}
        </Body>

        <View className="gap-4">
          <StreakCounter activeGoalId={activeGoalId} />
          <EmotionHeatmap activeGoalId={activeGoalId} />
          <BadgeRow activeGoalId={activeGoalId} />
        </View>
      </ScrollView>
    </SafeScreen>
  );
}
