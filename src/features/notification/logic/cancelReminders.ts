import notifee from '@notifee/react-native';

import { storage } from '@/utils/mmkv';
import { MMKV_KEYS } from '@/utils/mmkvKeys';

/**
 * True when `hour` (0-23) falls in the default quiet window (after 8pm or before 9am local).
 * Reminders are not scheduled in this window; pick another hour in settings later.
 */
export function isInQuietHours(hour: number): boolean {
  return hour < 9 || hour > 20;
}

function readScheduledIds(): string[] {
  const raw = storage.getString(MMKV_KEYS.notifScheduledIds);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === 'string');
  } catch {
    return [];
  }
}

/** Cancels stored trigger notifications and clears the id list. */
export async function cancelAllReminders(): Promise<void> {
  const ids = readScheduledIds();
  for (const id of ids) {
    try {
      await notifee.cancelTriggerNotification(id);
    } catch (e) {
      console.warn('[cancelAllReminders] cancel failed for', id, e);
    }
  }
  storage.remove(MMKV_KEYS.notifScheduledIds);
}

export function getScheduledIdsSnapshot(): string[] {
  return readScheduledIds();
}

export function setScheduledIds(ids: string[]): void {
  if (ids.length === 0) {
    storage.remove(MMKV_KEYS.notifScheduledIds);
  } else {
    storage.set(MMKV_KEYS.notifScheduledIds, JSON.stringify(ids));
  }
}
