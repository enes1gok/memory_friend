import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppCard } from '@/components/AppCard';
import { Body, Heading } from '@/components/Typography';
import { useCompanionLine } from '@/features/ai/hooks/useCompanionLine';

type Props = {
  activeGoalId: string | null;
  variant?: 'card' | 'embedded';
  /** When true, uses `companionText` and skips DB subscription (parent should use `useCompanionLine`). */
  disableFetch?: boolean;
  companionText?: string | null;
};

/**
 * Latest companion line from `ai_enrichments` for this goal, by most recent journal entry.
 */
export function CompanionCard({
  activeGoalId,
  variant = 'card',
  disableFetch = false,
  companionText,
}: Props) {
  const { t } = useTranslation();
  const fetched = useCompanionLine(disableFetch ? null : activeGoalId);
  const companion = disableFetch ? (companionText ?? null) : fetched;

  if (!activeGoalId) {
    return null;
  }
  if (companion == null || companion.length === 0) {
    return null;
  }

  const title = (
    <Heading className={variant === 'embedded' ? 'mb-1.5 text-base font-semibold' : 'mb-2 text-lg'}>
      {t('ai.companion.title')}
    </Heading>
  );
  const body = <Body className="leading-relaxed text-secondary">{companion}</Body>;

  if (variant === 'embedded') {
    return (
      <View
        testID="home:ai:companion:card"
        accessibilityLabel={`${t('ai.companion.title')}. ${companion}`}
      >
        {title}
        {body}
      </View>
    );
  }

  return (
    <AppCard testID="home:ai:companion:card" accessibilityLabel={`${t('ai.companion.title')}. ${companion}`}>
      {title}
      {body}
    </AppCard>
  );
}
