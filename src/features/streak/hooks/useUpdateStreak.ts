import { useDatabase } from '@nozbe/watermelondb/react';
import { useCallback } from 'react';

import type { BadgeTypeId } from '../constants/badgeTypes';
import { updateStreakAfterJournalWrite } from '../logic/updateStreakAfterJournalWrite';

export function useUpdateStreak() {
  const database = useDatabase();

  return useCallback(
    (goalId: string, at?: Date) => updateStreakAfterJournalWrite(database, goalId, at),
    [database],
  );
}

export type { BadgeTypeId };
