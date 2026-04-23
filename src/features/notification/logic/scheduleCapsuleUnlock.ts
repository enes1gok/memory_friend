import notifee, { AuthorizationStatus, TriggerType } from '@notifee/react-native';

import { CHANNEL_IDS, ensureChannels } from '../channels';
import i18n from '@/i18n';
import { storage } from '@/utils/mmkv';
import { MMKV_KEYS } from '@/utils/mmkvKeys';

const NOTIF_PREFIX = 'capsule-unlock-';

function canSchedule(authorization: AuthorizationStatus): boolean {
  return (
    authorization === AuthorizationStatus.AUTHORIZED || authorization === AuthorizationStatus.PROVISIONAL
  );
}

export type ScheduleCapsuleUnlockParams = {
  capsuleId: string;
  /** Used in notification copy. */
  capsuleTitle: string;
  unlocksAt: Date;
  now?: Date;
};

/**
 * Picks a fire time: respects quiet hours (before 9 / after 20 local) by moving to 9:00
 * the same or next day; ensures strictly after `now`.
 */
export function getCapsuleNotificationFireTime(unlocksAt: Date, now: Date = new Date()): Date {
  const d = new Date(unlocksAt);
  const h = d.getHours();
  if (h < 9) {
    d.setHours(9, 0, 0, 0);
  } else if (h > 20) {
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
  }
  if (d.getTime() <= now.getTime()) {
    return new Date(now.getTime() + 60_000);
  }
  return d;
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
  if (!canSchedule(settings.authorizationStatus)) {
    console.info('[scheduleCapsuleUnlock] permission not granted, skip');
    return;
  }

  const fireAt = getCapsuleNotificationFireTime(params.unlocksAt, now);
  if (fireAt.getTime() <= now.getTime()) {
    console.info('[scheduleCapsuleUnlock] no valid future fire time');
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
        data: {
          type: 'capsule_unlock',
          screen: 'CapsuleReveal',
          capsuleId: params.capsuleId,
        } as Record<string, string>,
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
  }
}
