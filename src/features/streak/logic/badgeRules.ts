import type { BadgeTypeId } from '../constants/badgeTypes';
import { ORDERED_BADGE_TYPES } from '../constants/badgeTypes';
import type { StreakSnapshot } from './computeStreak';

function meetsThreshold(snapshot: StreakSnapshot, id: BadgeTypeId): boolean {
  switch (id) {
    case 'first_entry':
      return snapshot.totalEntries >= 1;
    case 'streak_3':
      return snapshot.currentStreak >= 3;
    case 'streak_7':
      return snapshot.currentStreak >= 7;
    case 'streak_30':
      return snapshot.currentStreak >= 30;
    case 'total_10':
      return snapshot.totalEntries >= 10;
    case 'total_50':
      return snapshot.totalEntries >= 50;
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
}

/** Returns newly earned badge ids (order preserved) not already in `existing`. */
export function getNewBadgesToAward(
  snapshot: StreakSnapshot,
  existing: Set<BadgeTypeId>,
): BadgeTypeId[] {
  const out: BadgeTypeId[] = [];
  for (const id of ORDERED_BADGE_TYPES) {
    if (existing.has(id)) continue;
    if (meetsThreshold(snapshot, id)) {
      out.push(id);
    }
  }
  return out;
}
