import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, View } from 'react-native';

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
  variant?: 'card' | 'embedded' | 'compact';
};

type RowItem =
  | { kind: 'earned'; id: BadgeTypeId }
  | { kind: 'locked'; id: BadgeTypeId };

const PREVIEW_COUNT = 3;

export function BadgeRow({ activeGoalId, variant = 'card' }: Props) {
  const { t } = useTranslation();
  const { earnedIds, isHydrating } = useBadgesForGoal(activeGoalId);
  const earnedSet = new Set(earnedIds);

  if (!activeGoalId) {
    return null;
  }

  const items: RowItem[] = ORDERED_BADGE_TYPES.map((id) =>
    earnedSet.has(id) ? { kind: 'earned' as const, id } : { kind: 'locked' as const, id },
  );

  const earnedItems = items.filter((i) => i.kind === 'earned');
  const lockedItems = items.filter((i) => i.kind === 'locked');
  const previewItems: RowItem[] = (() => {
    const picked: RowItem[] = [];
    for (const it of earnedItems) {
      if (picked.length >= PREVIEW_COUNT) break;
      picked.push(it);
    }
    for (const it of lockedItems) {
      if (picked.length >= PREVIEW_COUNT) break;
      picked.push(it);
    }
    return picked;
  })();

  const title = (
    <Heading className={variant === 'embedded' ? 'mb-0.5 text-base font-semibold' : 'mb-1 text-lg'}>
      {t('badges.title')}
    </Heading>
  );
  const subtitle = (
    <Caption className={variant === 'embedded' ? 'mb-2 text-xs text-muted' : 'mb-3 text-sm'}>
      {t('badges.subtitle')}
    </Caption>
  );

  const fullList = isHydrating ? (
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
  );

  const compactList = isHydrating ? (
    <Body className="text-muted">{t('common.loading')}</Body>
  ) : (
    <View className="flex-row" style={{ gap: 10 }}>
      {previewItems.map((item) => {
        const def = BADGE_DISPLAY[item.id];
        const earned = item.kind === 'earned';
        return (
          <Pressable
            key={item.id}
            testID={`home:badge:${item.id}`}
            accessibilityRole="button"
            accessibilityLabel={
              earned
                ? t('badges.accessibility.earned', { name: t(def.nameKey) })
                : t('badges.accessibility.locked', { name: t(def.nameKey) })
            }
            className={`h-[52px] w-[52px] items-center justify-center rounded-2xl border ${
              earned ? 'border-accentOrange/40 bg-accentOrange/10' : 'border-white/10 bg-black/25 opacity-55'
            }`}
          >
            <Body className="text-2xl">{def.emoji}</Body>
          </Pressable>
        );
      })}
    </View>
  );

  if (variant === 'compact') {
    return (
      <View testID="home:badges:row">
        <View className="mb-2 flex-row items-center justify-between">
          <Caption className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            {t('badges.title')}
          </Caption>
        </View>
        {compactList}
      </View>
    );
  }

  if (variant === 'embedded') {
    return (
      <View testID="home:badges:row">
        {title}
        {subtitle}
        {fullList}
      </View>
    );
  }

  return (
    <AppCard testID="home:badges:row">
      {title}
      {subtitle}
      {fullList}
    </AppCard>
  );
}
