import type { Database } from '@nozbe/watermelondb';

import { scheduleCapsuleUnlock } from '@/features/notification/logic/scheduleCapsuleUnlock';
import type { Capsule } from '@/models/Capsule';
import { isUnlockDateInTheFuture, isCapsuleContentValid } from './capsuleStatus';

export type CreateCapsuleInput = {
  goalId: string;
  title: string;
  mediaPath?: string;
  text?: string;
  unlocksAt: Date;
};

/**
 * Inserts a capsule row and schedules delivery notification (no-op if permission missing).
 */
export async function createCapsule(
  database: Database,
  input: CreateCapsuleInput,
  now: Date = new Date(),
): Promise<Capsule> {
  if (!isCapsuleContentValid(input)) {
    throw new Error('[createCapsule] title and (media or text) required');
  }
  if (!isUnlockDateInTheFuture(input.unlocksAt, now)) {
    throw new Error('[createCapsule] unlocksAt must be in the future');
  }

  const capsules = database.get<Capsule>('capsules');
  const row = await database.write(async () => {
    return await capsules.create((c) => {
      c.goalId = input.goalId;
      c.title = input.title.trim();
      c.mediaPath = input.mediaPath?.trim();
      c.text = input.text?.trim();
      c.unlocksAt = input.unlocksAt;
      c.isUnlocked = false;
    });
  });

  try {
    await scheduleCapsuleUnlock({
      capsuleId: row.id,
      capsuleTitle: input.title.trim(),
      unlocksAt: input.unlocksAt,
      now,
    });
  } catch (e) {
    console.error('[createCapsule] scheduleCapsuleUnlock failed', e);
  }

  return row;
}
