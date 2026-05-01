import { useDatabase } from '@nozbe/watermelondb/react';
import { useCallback } from 'react';

import type { BadgeTypeId } from '@/features/streak/constants/badgeTypes';
import { updateStreakAfterJournalWrite } from '@/features/streak/logic/updateStreakAfterJournalWrite';
import type { JournalEntry } from '@/models/JournalEntry';
import { useGoalStore } from '@/stores/useGoalStore';

export type SaveJournalEntryArgs = {
  mediaPath?: string;
  mediaType?: string;
  moodTag: string;
  text?: string;
};

export type SaveJournalEntryResult = {
  entryId: string;
  newBadges: BadgeTypeId[];
};

export function useSaveJournalEntry() {
  const database = useDatabase();
  const activeGoalId = useGoalStore((s) => s.activeGoalId);

  return useCallback(
    async ({
      mediaPath,
      mediaType,
      moodTag,
      text,
    }: SaveJournalEntryArgs): Promise<SaveJournalEntryResult> => {
      if (!activeGoalId) {
        throw new Error('No active goal');
      }
      let newEntryId = '';
      await database.write(async () => {
        const created = await database.get<JournalEntry>('journal_entries').create((record) => {
          record.goalId = activeGoalId;
          record.capturedAt = new Date();
          record.moodTag = moodTag;
          if (mediaPath !== undefined) {
            record.mediaPath = mediaPath;
          }
          if (mediaType !== undefined) {
            record.mediaType = mediaType;
          }
          if (text !== undefined) {
            record.text = text;
          }
        });
        newEntryId = created.id;
      });
      const newBadges = await updateStreakAfterJournalWrite(database, activeGoalId);
      return { entryId: newEntryId, newBadges };
    },
    [activeGoalId, database],
  );
}
