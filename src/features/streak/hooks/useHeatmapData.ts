import { Q } from '@nozbe/watermelondb';
import { useDatabase } from '@nozbe/watermelondb/react';
import { useEffect, useMemo, useState } from 'react';

import type { JournalEntry } from '@/models/JournalEntry';

/** Map YYYY-MM-DD (local) -> latest mood tag that day. */
export function useHeatmapDayMoods(activeGoalId: string | null): Map<string, string> {
  const database = useDatabase();
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    if (!activeGoalId) {
      setEntries([]);
      return;
    }

    const sub = database
      .get<JournalEntry>('journal_entries')
      .query(Q.where('goal_id', activeGoalId), Q.sortBy('captured_at', Q.asc))
      .observe()
      .subscribe(setEntries);

    return () => sub.unsubscribe();
  }, [activeGoalId, database]);

  return useMemo(() => {
    const map = new Map<string, string>();
    for (const e of entries) {
      const iso = e.capturedAt.toLocaleDateString('en-CA');
      map.set(iso, e.moodTag);
    }
    return map;
  }, [entries]);
}
