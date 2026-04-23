import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Body, Heading } from '@/components/Typography';

import { useStreakState } from '../hooks/useStreakState';

type Props = {
  activeGoalId: string | null;
};

export function StreakCounter({ activeGoalId }: Props) {
  const { t } = useTranslation();
  const { currentStreak, longestStreak, isHydrating } = useStreakState(activeGoalId);

  if (!activeGoalId) {
    return null;
  }

  return (
    <View
      testID="home:streak:counter"
      className="rounded-2xl border border-white/10 bg-surface/80 px-4 py-4"
      accessibilityRole="summary"
      accessibilityLabel={t('streak.accessibility.counter', { count: currentStreak })}
    >
      <View className="flex-row items-center gap-3">
        <Body className="text-3xl" accessibilityLabel={t('streak.flameA11y')}>
          🔥
        </Body>
        <View className="flex-1">
          <Heading className="text-3xl font-bold">
            {isHydrating ? '…' : currentStreak}
          </Heading>
          <Body className="text-slate-400">{t('streak.dayStreak')}</Body>
        </View>
      </View>
      {longestStreak > 0 ? (
        <Body className="mt-2 text-sm text-slate-500">
          {t('streak.bestStreak', { count: longestStreak })}
        </Body>
      ) : null}
    </View>
  );
}
