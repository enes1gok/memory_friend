import { Q } from '@nozbe/watermelondb';
import { useDatabase } from '@nozbe/watermelondb/react';
import { useEffect, useMemo, useState } from 'react';

import { ENERGETIC_MOOD_TAGS, type MoodTagId } from '@/features/journal/constants/moods';
import type { JournalEntry } from '@/models/JournalEntry';

/**
 * Share of journal entries (for a goal) whose mood is in `ENERGETIC_MOOD_TAGS` (excited, happy).
 * Used for Stats copy like "You felt energetic 70% of the time."
 */
export function useGoalMoodEnergyPercent(activeGoalId: string | null): {
  percent: number | null;
  total: number;
} {
  const database = useDatabase();
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    if (activeGoalId == null) {
      setEntries([]);
      return;
    }
    const sub = database
      .get<JournalEntry>('journal_entries')
      .query(Q.where('goal_id', activeGoalId))
      .observe()
      .subscribe(setEntries);
    return () => sub.unsubscribe();
  }, [activeGoalId, database]);

  return useMemo(() => {
    const total = entries.length;
    if (total === 0) {
      return { percent: null, total: 0 };
    }
    const energetic = entries.filter((e) =>
      ENERGETIC_MOOD_TAGS.has(e.moodTag as MoodTagId),
    ).length;
    const percent = Math.round((100 * energetic) / total);
    return { percent, total };
  }, [entries]);
}
