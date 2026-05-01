import { Q } from '@nozbe/watermelondb';
import { useDatabase } from '@nozbe/watermelondb/react';
import { useCallback, useRef } from 'react';

import { tagEmotionsAndCompanion } from '../logic/tagEmotions';
import { transcribeAudio } from '../logic/transcribeAudio';
import type { AiEnrichment } from '@/models/AiEnrichment';

const inFlight = new Set<string>();

export type TriggerEnrichmentArgs = {
  entryId: string;
  mediaPath: string;
  mediaType: string;
};

/**
 * After a journal entry is saved, run Whisper + GPT off the hot path and persist to `ai_enrichments`.
 * Idempotent: skips when an enrichment row already has a non-empty transcript.
 * Runs for video (audio track) and standalone voice notes (`audio`); photo/text-only entries are skipped.
 */
export function useEnrichJournalEntry() {
  const database = useDatabase();
  const databaseRef = useRef(database);
  databaseRef.current = database;

  const triggerEnrichment = useCallback((args: TriggerEnrichmentArgs) => {
    const { entryId, mediaPath, mediaType } = args;
    if (mediaType !== 'video' && mediaType !== 'audio') {
      return;
    }
    if (inFlight.has(entryId)) {
      return;
    }
    inFlight.add(entryId);

    void (async () => {
      const db = databaseRef.current;
      try {
        const col = db.get<AiEnrichment>('ai_enrichments');
        const existing = await col.query(Q.where('journal_entry_id', entryId)).fetch();
        const row0 = existing[0];
        if (row0?.transcription != null && row0.transcription.length > 0) {
          return;
        }

        const transcript = await transcribeAudio(mediaPath);
        const { emotionTags, companionMessage } = await tagEmotionsAndCompanion(transcript ?? '');

        await db.write(async () => {
          const rows = await col.query(Q.where('journal_entry_id', entryId)).fetch();
          const row = rows[0];
          if (row?.transcription != null && row.transcription.length > 0) {
            return;
          }
          const tagStr = emotionTags.length > 0 ? emotionTags.join('|') : undefined;
          if (!row) {
            await col.create((r) => {
              r.journalEntryId = entryId;
              r.transcription = transcript ?? undefined;
              r.emotionTagsRaw = tagStr;
              r.companionMessage = companionMessage ?? undefined;
            });
          } else {
            await row.update((r) => {
              r.transcription = transcript ?? undefined;
              r.emotionTagsRaw = tagStr;
              r.companionMessage = companionMessage ?? undefined;
            });
          }
        });
      } catch (e) {
        console.warn('[useEnrichJournalEntry] failed', e);
      } finally {
        inFlight.delete(entryId);
      }
    })();
  }, []);

  return { triggerEnrichment };
}
