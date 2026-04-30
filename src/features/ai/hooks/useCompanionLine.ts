import { Q } from '@nozbe/watermelondb';
import { useDatabase } from '@nozbe/watermelondb/react';
import { useEffect, useState } from 'react';

import type { AiEnrichment } from '@/models/AiEnrichment';
import type { JournalEntry } from '@/models/JournalEntry';

/**
 * Latest companion line from `ai_enrichments` for this goal,
 * by most recent journal entry with a companion message.
 */
export function useCompanionLine(activeGoalId: string | null): string | null {
  const database = useDatabase();
  const [companion, setCompanion] = useState<string | null>(null);

  useEffect(() => {
    if (!activeGoalId) {
      setCompanion(null);
      return;
    }
    const sub = database
      .get<JournalEntry>('journal_entries')
      .query(Q.where('goal_id', activeGoalId), Q.sortBy('captured_at', Q.desc))
      .observe()
      .subscribe((entries) => {
        void (async () => {
          const enr = database.get<AiEnrichment>('ai_enrichments');
          for (const e of entries) {
            const rows = await enr.query(Q.where('journal_entry_id', e.id)).fetch();
            const msg = rows[0]?.companionMessage;
            if (msg) {
              setCompanion(msg);
              return;
            }
          }
          setCompanion(null);
        })();
      });
    return () => sub.unsubscribe();
  }, [activeGoalId, database]);

  return companion;
}
