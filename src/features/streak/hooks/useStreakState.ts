import { Q } from '@nozbe/watermelondb';
import { useDatabase } from '@nozbe/watermelondb/react';
import { useEffect, useMemo, useState } from 'react';

import type { StreakState } from '@/models/StreakState';
import { storage } from '@/utils/mmkv';
import { MMKV_KEYS } from '@/utils/mmkvKeys';

export type StreakViewModel = {
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate?: string;
  totalEntries: number;
  /** True when we have not yet received first emission for this goal. */
  isHydrating: boolean;
};

/**
 * Observes streak_state for the active goal; seeds counts from MMKV for fast first paint.
 */
export function useStreakState(activeGoalId: string | null): StreakViewModel {
  const database = useDatabase();
  const [row, setRow] = useState<StreakState | null | undefined>(undefined);

  const mmkvSeed = useMemo(
    () => ({
      current: Number(storage.getString(MMKV_KEYS.streakCurrentCount) ?? '0') || 0,
      last: storage.getString(MMKV_KEYS.streakLastCheckIn) ?? undefined,
    }),
    [],
  );

  useEffect(() => {
    if (!activeGoalId) {
      setRow(null);
      return;
    }

    setRow(undefined);
    const sub = database
      .get<StreakState>('streak_state')
      .query(Q.where('goal_id', activeGoalId))
      .observe()
      .subscribe((rows) => {
        const first = rows[0] ?? null;
        setRow(first);
        if (first) {
          storage.set(MMKV_KEYS.streakCurrentCount, String(first.currentStreak));
          storage.set(MMKV_KEYS.streakLastCheckIn, first.lastCheckInDate ?? '');
        }
      });

    return () => sub.unsubscribe();
  }, [activeGoalId, database]);

  return useMemo(() => {
    if (!activeGoalId) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalEntries: 0,
        lastCheckInDate: undefined,
        isHydrating: false,
      };
    }
    if (row === undefined) {
      return {
        currentStreak: mmkvSeed.current,
        longestStreak: 0,
        totalEntries: 0,
        lastCheckInDate: mmkvSeed.last,
        isHydrating: true,
      };
    }
    if (row === null) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalEntries: 0,
        lastCheckInDate: undefined,
        isHydrating: false,
      };
    }
    return {
      currentStreak: row.currentStreak,
      longestStreak: row.longestStreak,
      totalEntries: row.totalEntries,
      lastCheckInDate: row.lastCheckInDate,
      isHydrating: false,
    };
  }, [activeGoalId, mmkvSeed, row]);
}
