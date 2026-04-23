import { type Database, Q } from '@nozbe/watermelondb';

import type { Badge } from '@/models/Badge';
import type { StreakState } from '@/models/StreakState';
import { storage } from '@/utils/mmkv';
import { MMKV_KEYS } from '@/utils/mmkvKeys';

import { isBadgeTypeId, type BadgeTypeId } from '../constants/badgeTypes';
import { getNewBadgesToAward } from './badgeRules';
import { computeStreakAfterNewEntry, todayIsoLocal, type StreakSnapshot } from './computeStreak';

/**
 * Run after a journal entry is persisted: upsert streak_state, award badges, refresh MMKV cache.
 * @returns Newly awarded badge ids for celebration UI.
 */
export async function updateStreakAfterJournalWrite(
  database: Database,
  goalId: string,
  now: Date = new Date(),
): Promise<BadgeTypeId[]> {
  const todayIso = todayIsoLocal(now);
  const streakCollection = database.get<StreakState>('streak_state');
  const existingRows = await streakCollection.query(Q.where('goal_id', goalId)).fetch();

  let streakRowId: string | undefined;
  let prev: StreakSnapshot;

  if (existingRows.length > 0) {
    const row = existingRows[0]!;
    streakRowId = row.id;
    prev = {
      currentStreak: row.currentStreak,
      longestStreak: row.longestStreak,
      lastCheckInDate: row.lastCheckInDate,
      totalEntries: row.totalEntries,
    };
  } else {
    prev = {
      currentStreak: 0,
      longestStreak: 0,
      lastCheckInDate: undefined,
      totalEntries: 0,
    };
  }

  const next = computeStreakAfterNewEntry(prev, todayIso);

  const badgeRows = await database.get<Badge>('badges').query(Q.where('goal_id', goalId)).fetch();
  const existingBadges = new Set<BadgeTypeId>();
  for (const b of badgeRows) {
    if (isBadgeTypeId(b.badgeType)) {
      existingBadges.add(b.badgeType);
    }
  }
  const newBadgeIds = getNewBadgesToAward(next, existingBadges);

  await database.write(async () => {
    if (streakRowId) {
      const row = await streakCollection.find(streakRowId);
      await row.update((r) => {
        r.currentStreak = next.currentStreak;
        r.longestStreak = next.longestStreak;
        r.lastCheckInDate = next.lastCheckInDate;
        r.totalEntries = next.totalEntries;
      });
    } else {
      await streakCollection.create((r) => {
        r.goalId = goalId;
        r.currentStreak = next.currentStreak;
        r.longestStreak = next.longestStreak;
        r.lastCheckInDate = next.lastCheckInDate;
        r.totalEntries = next.totalEntries;
      });
    }

    const awardedAt = now;
    const badgeCollection = database.get<Badge>('badges');
    for (const id of newBadgeIds) {
      await badgeCollection.create((r) => {
        r.goalId = goalId;
        r.badgeType = id;
        r.awardedAt = awardedAt;
      });
    }
  });

  storage.set(MMKV_KEYS.streakCurrentCount, String(next.currentStreak));
  storage.set(MMKV_KEYS.streakLastCheckIn, next.lastCheckInDate ?? '');

  return newBadgeIds;
}
