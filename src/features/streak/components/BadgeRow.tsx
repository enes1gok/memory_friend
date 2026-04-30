import { useTranslation } from 'react-i18next';
import { FlatList, Pressable } from 'react-native';

import { AppCard } from '@/components/AppCard';
import { Body, Caption, Heading } from '@/components/Typography';

import {
  BADGE_DISPLAY,
  ORDERED_BADGE_TYPES,
  type BadgeTypeId,
} from '../constants/badgeTypes';
import { useBadgesForGoal } from '../hooks/useBadgesForGoal';

type Props = {
  activeGoalId: string | null;
};

type RowItem =
  | { kind: 'earned'; id: BadgeTypeId }
  | { kind: 'locked'; id: BadgeTypeId };

export function BadgeRow({ activeGoalId }: Props) {
  const { t } = useTranslation();
  const { earnedIds, isHydrating } = useBadgesForGoal(activeGoalId);
  const earnedSet = new Set(earnedIds);

  if (!activeGoalId) {
    return null;
  }

  const items: RowItem[] = ORDERED_BADGE_TYPES.map((id) =>
    earnedSet.has(id) ? { kind: 'earned' as const, id } : { kind: 'locked' as const, id },
  );

  return (
    <AppCard testID="home:badges:row">
      <Heading className="mb-1 text-lg">{t('badges.title')}</Heading>
      <Caption className="mb-3 text-sm">{t('badges.subtitle')}</Caption>

      {isHydrating ? (
        <Body className="text-muted">{t('common.loading')}</Body>
      ) : (
        <FlatList
          horizontal
          data={items}
          keyExtractor={(it) => it.id}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const def = BADGE_DISPLAY[item.id];
            const earned = item.kind === 'earned';
            return (
              <Pressable
                testID={`home:badge:${item.id}`}
                accessibilityRole="button"
                accessibilityLabel={
                  earned
                    ? t('badges.accessibility.earned', { name: t(def.nameKey) })
                    : t('badges.accessibility.locked', { name: t(def.nameKey) })
                }
                className={`min-w-[88px] items-center rounded-xl border px-3 py-3 ${index < items.length - 1 ? 'mr-3' : ''} ${
                  earned ? 'border-accentOrange/40 bg-accentOrange/10' : 'border-white/10 bg-black/25 opacity-55'
                }`}
              >
                <Body className="mb-1 text-2xl">{def.emoji}</Body>
                <Caption
                  className={`text-center text-xs ${earned ? 'text-primary' : 'text-muted'}`}
                  numberOfLines={2}
                >
                  {t(def.nameKey)}
                </Caption>
              </Pressable>
            );
          }}
        />
      )}
    </AppCard>
  );
}
