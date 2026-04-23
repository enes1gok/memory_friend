import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, View } from 'react-native';

import { Body, Heading } from '@/components/Typography';

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
    <View testID="home:badges:row" className="rounded-2xl border border-white/10 bg-surface/80 px-4 py-4">
      <Heading className="mb-1 text-lg">{t('badges.title')}</Heading>
      <Body className="mb-3 text-sm text-slate-400">{t('badges.subtitle')}</Body>

      {isHydrating ? (
        <Body className="text-slate-500">{t('common.loading')}</Body>
      ) : (
        <FlatList
          horizontal
          data={items}
          keyExtractor={(it) => it.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => {
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
                className={`min-w-[88px] items-center rounded-xl border px-3 py-3 ${
                  earned ? 'border-orange-500/40 bg-orange-500/10' : 'border-white/10 bg-black/20 opacity-50'
                }`}
              >
                <Body className="mb-1 text-2xl">{def.emoji}</Body>
                <Body
                  className={`text-center text-xs font-semibold ${earned ? 'text-white' : 'text-slate-500'}`}
                  numberOfLines={2}
                >
                  {t(def.nameKey)}
                </Body>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
