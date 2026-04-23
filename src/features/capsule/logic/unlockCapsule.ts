import type { Database } from '@nozbe/watermelondb';
import { Q } from '@nozbe/watermelondb';

import type { Capsule } from '@/models/Capsule';

/**
 * Marks a past-due locked capsule as unlocked. No-op if still sealed by time.
 */
export async function unlockCapsuleId(database: Database, capsuleId: string, now: Date = new Date()): Promise<void> {
  const found = await database.get<Capsule>('capsules').find(capsuleId);
  if (found.isUnlocked) {
    return;
  }
  if (found.unlocksAt.getTime() > now.getTime()) {
    return;
  }
  await database.write(async () => {
    const row = await database.get<Capsule>('capsules').find(capsuleId);
    if (!row.isUnlocked) {
      await row.update((c) => {
        c.isUnlocked = true;
      });
    }
  });
}

/**
 * Unlocks all capsules for a goal that are past `unlocks_at` but not yet marked unlocked.
 */
export async function unlockDueCapsulesForGoal(
  database: Database,
  goalId: string,
  now: Date = new Date(),
): Promise<void> {
  const due = await database
    .get<Capsule>('capsules')
    .query(
      Q.where('goal_id', goalId),
      Q.where('is_unlocked', false),
      Q.where('unlocks_at', Q.lte(now.getTime())),
    )
    .fetch();

  if (due.length === 0) {
    return;
  }

  await database.write(async () => {
    for (const c of due) {
      await c.update((row) => {
        row.isUnlocked = true;
      });
    }
  });
}
