import { useDatabase } from '@nozbe/watermelondb/react';
import { useCallback } from 'react';

import type { JournalEntry } from '@/models/JournalEntry';
import { useGoalStore } from '@/stores/useGoalStore';

export type SaveJournalEntryArgs = {
  mediaPath: string;
  mediaType: string;
  moodTag: string;
  text?: string;
};

export function useSaveJournalEntry() {
  const database = useDatabase();
  const activeGoalId = useGoalStore((s) => s.activeGoalId);

  return useCallback(
    async ({ mediaPath, mediaType, moodTag, text }: SaveJournalEntryArgs) => {
      if (!activeGoalId) {
        throw new Error('No active goal');
      }
      await database.write(async () => {
        await database.get<JournalEntry>('journal_entries').create((record) => {
          record.goalId = activeGoalId;
          record.capturedAt = new Date();
          record.moodTag = moodTag;
          record.mediaPath = mediaPath;
          record.mediaType = mediaType;
          if (text !== undefined) {
            record.text = text;
          }
        });
      });
    },
    [activeGoalId, database],
  );
}
