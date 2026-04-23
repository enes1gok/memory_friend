import { ORDERED_BADGE_TYPES, type BadgeTypeId } from '../constants/badgeTypes';

/** Pick the highest-tier badge in roadmap order for a single celebration moment. */
export function pickBestNewBadge(newBadges: BadgeTypeId[]): BadgeTypeId | null {
  if (newBadges.length === 0) {
    return null;
  }
  let bestIdx = -1;
  let best: BadgeTypeId | null = null;
  for (const b of newBadges) {
    const i = ORDERED_BADGE_TYPES.indexOf(b);
    if (i > bestIdx) {
      bestIdx = i;
      best = b;
    }
  }
  return best;
}
