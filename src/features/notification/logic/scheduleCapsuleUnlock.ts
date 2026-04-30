import notifee, { TriggerType } from '@notifee/react-native';

import { CHANNEL_IDS, ensureChannels } from '../channels';
import { clearCapsuleScheduledMapEntry } from './cancelCapsuleNotification';
import { buildCapsuleUnlockData } from './payloads';
import { adjustUnlockDateOutOfQuietWindow, canScheduleNotification } from './policy';
import i18n from '@/i18n';
import { storage } from '@/utils/mmkv';
import { MMKV_KEYS } from '@/utils/mmkvKeys';

const NOTIF_PREFIX = 'capsule-unlock-';

export type ScheduleCapsuleUnlockParams = {
  capsuleId: string;
  /** Used in notification copy. */
  capsuleTitle: string;
  unlocksAt: Date;
  now?: Date;
};

/**
 * Computes fire time: eligible window adjustment + strictly after `now`.
 * Exported for callers that must predict the scheduled moment.
 */
export function getCapsuleNotificationFireTime(unlocksAt: Date, now: Date = new Date()): Date {
  return adjustUnlockDateOutOfQuietWindow(unlocksAt, now);
}

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

export function setCapsuleScheduledId(capsuleId: string, notificationId: string): void {
  const map = readCapsuleIdMap();
  map[capsuleId] = notificationId;
  storage.set(MMKV_KEYS.capsuleScheduledIds, JSON.stringify(map));
}

/**
 * Idempotent: replaces prior trigger for this capsule id, schedules at computed fire time.
 */
export async function scheduleCapsuleUnlock(params: ScheduleCapsuleUnlockParams): Promise<void> {
  const now = params.now ?? new Date();
  const notifId = `${NOTIF_PREFIX}${params.capsuleId}`;

  try {
    await notifee.cancelTriggerNotification(notifId);
  } catch {
    // ignore
  }

  const settings = await notifee.getNotificationSettings();
  if (!canScheduleNotification(settings.authorizationStatus)) {
    console.info('[scheduleCapsuleUnlock] permission not granted, skip');
    clearCapsuleScheduledMapEntry(params.capsuleId);
    return;
  }

  const fireAt = getCapsuleNotificationFireTime(params.unlocksAt, now);
  if (fireAt.getTime() <= now.getTime()) {
    console.info('[scheduleCapsuleUnlock] no valid future fire time');
    clearCapsuleScheduledMapEntry(params.capsuleId);
    return;
  }

  await ensureChannels();

  const title = i18n.t('notifications.capsule.title', { title: params.capsuleTitle });
  const body = i18n.t('notifications.capsule.body', { title: params.capsuleTitle });

  try {
    await notifee.createTriggerNotification(
      {
        id: notifId,
        title,
        body,
        data: buildCapsuleUnlockData({ capsuleId: params.capsuleId }),
        android: {
          channelId: CHANNEL_IDS.CAPSULE_DELIVERY,
          pressAction: { id: 'default' },
        },
        ios: { sound: 'default' },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: fireAt.getTime(),
        alarmManager: { allowWhileIdle: true },
      },
    );
    setCapsuleScheduledId(params.capsuleId, notifId);
  } catch (e) {
    console.error('[scheduleCapsuleUnlock] createTriggerNotification failed', e);
    clearCapsuleScheduledMapEntry(params.capsuleId);
  }
}
