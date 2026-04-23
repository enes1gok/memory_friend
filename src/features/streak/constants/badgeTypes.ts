export const BADGE_TYPES = [
  'first_entry',
  'streak_3',
  'streak_7',
  'streak_30',
  'total_10',
  'total_50',
] as const;

export type BadgeTypeId = (typeof BADGE_TYPES)[number];

/** Evaluation order for awarding multiple badges in one save. */
export const ORDERED_BADGE_TYPES: readonly BadgeTypeId[] = BADGE_TYPES;

export type BadgeDisplay = {
  id: BadgeTypeId;
  emoji: string;
  nameKey: string;
  descriptionKey: string;
};

export const BADGE_DISPLAY: Record<BadgeTypeId, BadgeDisplay> = {
  first_entry: {
    id: 'first_entry',
    emoji: '🌱',
    nameKey: 'badges.firstEntry.name',
    descriptionKey: 'badges.firstEntry.description',
  },
  streak_3: {
    id: 'streak_3',
    emoji: '🔥',
    nameKey: 'badges.streak3.name',
    descriptionKey: 'badges.streak3.description',
  },
  streak_7: {
    id: 'streak_7',
    emoji: '⭐',
    nameKey: 'badges.streak7.name',
    descriptionKey: 'badges.streak7.description',
  },
  streak_30: {
    id: 'streak_30',
    emoji: '🏆',
    nameKey: 'badges.streak30.name',
    descriptionKey: 'badges.streak30.description',
  },
  total_10: {
    id: 'total_10',
    emoji: '📔',
    nameKey: 'badges.total10.name',
    descriptionKey: 'badges.total10.description',
  },
  total_50: {
    id: 'total_50',
    emoji: '💎',
    nameKey: 'badges.total50.name',
    descriptionKey: 'badges.total50.description',
  },
};

export function isBadgeTypeId(value: string): value is BadgeTypeId {
  return (BADGE_TYPES as readonly string[]).includes(value);
}
