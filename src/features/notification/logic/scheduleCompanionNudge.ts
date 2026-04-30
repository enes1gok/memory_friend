import notifee, { TriggerType } from '@notifee/react-native';

import { CHANNEL_IDS, ensureChannels } from '../channels';
import { buildAiCompanionData } from './payloads';
import { canScheduleNotification, isDateTimeInQuietWindow, QUIET_BEFORE_HOUR } from './policy';
import i18n from '@/i18n';
import { storage } from '@/utils/mmkv';
import { MMKV_KEYS } from '@/utils/mmkvKeys';

const NOTIF_ID_COMPANION = 'notif-ai-companion';

/**
 * Fire ~15 minutes from now, rolling outside the quiet window to the next eligible time (baseline policy).
 */
function computeCompanionFireTime(now: Date = new Date()): Date {
  let t = new Date(now.getTime() + 15 * 60 * 1000);
  for (let i = 0; i < 48; i += 1) {
    if (!isDateTimeInQuietWindow(t)) {
      return t;
    }
    if (t.getHours() < QUIET_BEFORE_HOUR) {
      t.setHours(QUIET_BEFORE_HOUR, 0, 0, 0);
    } else {
      t = new Date(t);
      t.setDate(t.getDate() + 1);
      t.setHours(QUIET_BEFORE_HOUR, 0, 0, 0);
    }
  }
  return new Date(now.getTime() + 60 * 60 * 1000);
}

/**
 * One-off empathetic nudge (e.g. after repeated "stressed" runs). Deduplicated per local calendar day via MMKV.
 */
export async function scheduleCompanionNudge(params?: { goalId?: string }): Promise<void> {
  const today = new Date().toLocaleDateString('en-CA');
  const last = storage.getString(MMKV_KEYS.aiLastNudgeDate);
  if (last === today) {
    return;
  }

  const settings = await notifee.getNotificationSettings();
  if (!canScheduleNotification(settings.authorizationStatus)) {
    return;
  }

  await ensureChannels();

  const fire = computeCompanionFireTime();

  try {
    await notifee.cancelTriggerNotification(NOTIF_ID_COMPANION);
  } catch {
    // ignore
  }

  const title = i18n.t('notifications.companion.title');
  const body = i18n.t('notifications.companion.body');

  try {
    await notifee.createTriggerNotification(
      {
        id: NOTIF_ID_COMPANION,
        title,
        body,
        data: buildAiCompanionData({ goalId: params?.goalId }),
        android: {
          channelId: CHANNEL_IDS.AI_COMPANION,
          pressAction: { id: 'default' },
        },
        ios: { sound: 'default' },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: fire.getTime(),
        alarmManager: { allowWhileIdle: true },
      },
    );
    storage.set(MMKV_KEYS.aiLastNudgeDate, today);
  } catch (e) {
    console.error('[scheduleCompanionNudge] createTriggerNotification failed', e);
  }
}

export function getCompanionNotificationId(): string {
  return NOTIF_ID_COMPANION;
}
