import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppCard } from '@/components/AppCard';
import { Body, Caption, Heading } from '@/components/Typography';

import { useStreakState } from '../hooks/useStreakState';

type Props = {
  activeGoalId: string | null;
  /** Narrow card for dashboard stats row */
  compact?: boolean;
};

export function StreakCounter({ activeGoalId, compact = false }: Props) {
  const { t } = useTranslation();
  const { currentStreak, longestStreak, isHydrating } = useStreakState(activeGoalId);

  if (!activeGoalId) {
    return null;
  }

  if (compact) {
    return (
      <AppCard
        testID="home:streak:counter"
        className="flex-1 py-3"
        accessibilityRole="summary"
        accessibilityLabel={t('streak.accessibility.counter', { count: currentStreak })}
      >
        <Caption className="mb-1 text-xs uppercase tracking-wide text-muted">
          {t('home.stats.streakLabel')}
        </Caption>
        <View className="flex-row items-baseline gap-1">
          <Heading className="text-3xl font-bold">{isHydrating ? '…' : currentStreak}</Heading>
          <Caption className="text-muted">{t('streak.dayStreakShort')}</Caption>
        </View>
        {longestStreak > 0 ? (
          <Caption className="mt-2 text-xs text-muted">
            {t('streak.bestStreak', { count: longestStreak })}
          </Caption>
        ) : null}
      </AppCard>
    );
  }

  return (
    <AppCard
      testID="home:streak:counter"
      accessibilityRole="summary"
      accessibilityLabel={t('streak.accessibility.counter', { count: currentStreak })}
    >
      <View className="flex-row items-center gap-3">
        <Body className="text-2xl" accessibilityLabel={t('streak.flameA11y')}>
          🔥
        </Body>
        <View className="flex-1">
          <Heading className="text-3xl font-bold">
            {isHydrating ? '…' : currentStreak}
          </Heading>
          <Body className="text-muted">{t('streak.dayStreak')}</Body>
        </View>
      </View>
      {longestStreak > 0 ? (
        <Caption className="mt-2 text-muted">{t('streak.bestStreak', { count: longestStreak })}</Caption>
      ) : null}
    </AppCard>
  );
}
