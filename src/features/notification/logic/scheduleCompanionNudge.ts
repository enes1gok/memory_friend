import notifee, { AuthorizationStatus, TriggerType } from '@notifee/react-native';

import { CHANNEL_IDS, ensureChannels } from '../channels';
import i18n from '@/i18n';
import { storage } from '@/utils/mmkv';
import { MMKV_KEYS } from '@/utils/mmkvKeys';

const NOTIF_ID_COMPANION = 'notif-ai-companion';

function isDateInQuietWindow(d: Date): boolean {
  const h = d.getHours();
  return h < 9 || h > 20;
}

/**
 * Picks a fire time: ~15m from now, outside 9am–8pm (local) is rolled to 9:00, capped within ~24h for edge cases.
 */
function computeCompanionFireTime(now: Date = new Date()): Date {
  let t = new Date(now.getTime() + 15 * 60 * 1000);
  for (let i = 0; i < 48; i += 1) {
    if (!isDateInQuietWindow(t)) {
      return t;
    }
    if (t.getHours() < 9) {
      t.setHours(9, 0, 0, 0);
    } else {
      t = new Date(t);
      t.setDate(t.getDate() + 1);
      t.setHours(9, 0, 0, 0);
    }
  }
  return new Date(now.getTime() + 60 * 60 * 1000);
}

function canSchedule(status: AuthorizationStatus): boolean {
  return status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;
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
  if (!canSchedule(settings.authorizationStatus)) {
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
        data: {
          screen: 'Home',
          type: 'ai_companion',
          ...(params?.goalId ? { goalId: params.goalId } : {}),
        } as Record<string, string>,
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
