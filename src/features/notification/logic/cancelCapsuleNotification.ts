import notifee from '@notifee/react-native';

import { storage } from '@/utils/mmkv';
import { MMKV_KEYS } from '@/utils/mmkvKeys';

const NOTIF_PREFIX = 'capsule-unlock-';

type CapsuleIdMap = Record<string, string>;

function readCapsuleIdMap(): CapsuleIdMap {
  const raw = storage.getString(MMKV_KEYS.capsuleScheduledIds);
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    return parsed as CapsuleIdMap;
  } catch {
    return {};
  }
}

function writeCapsuleIdMap(map: CapsuleIdMap): void {
  if (Object.keys(map).length === 0) {
    storage.remove(MMKV_KEYS.capsuleScheduledIds);
  } else {
    storage.set(MMKV_KEYS.capsuleScheduledIds, JSON.stringify(map));
  }
}

export async function cancelCapsuleNotification(capsuleId: string): Promise<void> {
  const id = `${NOTIF_PREFIX}${capsuleId}`;
  try {
    await notifee.cancelTriggerNotification(id);
  } catch (e) {
    console.warn('[cancelCapsuleNotification] cancel failed', e);
  }
  clearCapsuleScheduledMapEntry(capsuleId);
}

/** Clears MMKV mapping only (no Notifee cancel). Use when schedule failed after OS trigger was already cleared. */
export function clearCapsuleScheduledMapEntry(capsuleId: string): void {
  const map = readCapsuleIdMap();
  if (map[capsuleId]) {
    delete map[capsuleId];
    writeCapsuleIdMap(map);
  }
}
