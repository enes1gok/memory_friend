import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppCard } from '@/components/AppCard';
import { Caption, Heading } from '@/components/Typography';
import type { Goal } from '@/models/Goal';

import { journeyPercent } from '../logic/journeyPercent';

type Props = {
  goal: Goal;
  accentColor: string;
};

export function JourneyProgressCard({ goal, accentColor }: Props) {
  const { t } = useTranslation();
  const pct = journeyPercent(goal);

  return (
    <AppCard testID="home:journey:progress" className="flex-1 py-3" accessibilityRole="summary">
      <Caption className="mb-1 text-xs uppercase tracking-wide text-muted">
        {t('home.stats.journeyLabel')}
      </Caption>
      <Heading className="text-3xl">{pct}%</Heading>
      <Caption className="mt-0.5 text-xs text-muted">
        {t('home.stats.journeyHint')}
      </Caption>
      <View className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <View
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: 4,
            backgroundColor: accentColor,
          }}
        />
      </View>
    </AppCard>
  );
}
