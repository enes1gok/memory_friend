import { Q } from '@nozbe/watermelondb';
import { useDatabase } from '@nozbe/watermelondb/react';
import { useEffect, useState } from 'react';

import type { AiEnrichment } from '@/models/AiEnrichment';

/** Subscribes to the first `ai_enrichments` row for a journal entry (e.g. Whisper transcript). */
export function useJournalEntryTranscript(journalEntryId: string | undefined): string | undefined {
  const database = useDatabase();
  const [transcript, setTranscript] = useState<string | undefined>();

  useEffect(() => {
    if (journalEntryId == null || journalEntryId.length === 0) {
      setTranscript(undefined);
      return;
    }
    const sub = database
      .get<AiEnrichment>('ai_enrichments')
      .query(Q.where('journal_entry_id', journalEntryId))
      .observe()
      .subscribe((rows) => {
        const t = rows[0]?.transcription?.trim();
        setTranscript(t && t.length > 0 ? t : undefined);
      });
    return () => sub.unsubscribe();
  }, [database, journalEntryId]);

  return transcript;
}
