import notifee, { AuthorizationStatus, TriggerType } from '@notifee/react-native';

import { CHANNEL_IDS, ensureChannels } from '../channels';
import { cancelAllReminders, isInQuietHours, setScheduledIds } from './cancelReminders';
import { getDailyReminderCopy } from './copyFactory';
import { getCalendarDaysDiff } from '@/features/streak/logic/computeStreak';
import { storage } from '@/utils/mmkv';
import { MMKV_KEYS } from '@/utils/mmkvKeys';

export const DEFAULT_REMINDER_HOUR = 20;

const NOTIF_ID_DAILY = 'daily-goal-reminder';

export type ScheduleOrRescheduleParams = {
  goalId: string;
  goalTitle: string;
  targetDate: Date;
  /** Local hour 0-23, default 20. */
  reminderHour?: number;
  streakCount: number;
  now?: Date;
};

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Returns the next `Date` at `reminderHour` (local) that is strictly after `now`, on or before `targetDate` (same calendar day allowed).
 * Returns `null` if the goal is past or no valid slot remains.
 */
export function getNextFireTime(
  now: Date,
  targetDate: Date,
  reminderHour: number,
): Date | null {
  const nowMs = now.getTime();
  const targetDayStart = startOfLocalDay(targetDate);
  if (targetDayStart.getTime() < startOfLocalDay(now).getTime()) {
    console.info('[scheduleDaily] target date in the past, skip');
    return null;
  }

  const targetIso = targetDayStart.toLocaleDateString('en-CA');
  const todayStart = startOfLocalDay(now);

  for (let dayOffset = 0; dayOffset < 366; dayOffset += 1) {
    const day = new Date(todayStart);
    day.setDate(day.getDate() + dayOffset);
    const dayIso = day.toLocaleDateString('en-CA');
    const daysUntilTarget = getCalendarDaysDiff(dayIso, targetIso);
    if (daysUntilTarget < 0) {
      break;
    }
    const candidate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), reminderHour, 0, 0, 0);
    if (candidate.getTime() > nowMs) {
      return candidate;
    }
  }
  return null;
}

function canSchedule(authorization: AuthorizationStatus): boolean {
  return (
    authorization === AuthorizationStatus.AUTHORIZED || authorization === AuthorizationStatus.PROVISIONAL
  );
}

/**
 * Idempotent: cancels previous daily triggers, then schedules the next one with contextual copy.
 */
export async function scheduleOrReschedule(params: ScheduleOrRescheduleParams): Promise<void> {
  const now = params.now ?? new Date();
  await cancelAllReminders();

  const settings = await notifee.getNotificationSettings();
  if (!canSchedule(settings.authorizationStatus)) {
    console.info('[scheduleDaily] notification permission not granted, skip');
    return;
  }

  const reminderHour = params.reminderHour ?? DEFAULT_REMINDER_HOUR;
  if (isInQuietHours(reminderHour)) {
    console.info('[scheduleDaily] reminder hour in quiet window, skip', reminderHour);
    return;
  }

  await ensureChannels();

  const nextFire = getNextFireTime(now, params.targetDate, reminderHour);
  if (!nextFire) {
    return;
  }

  const fireDayIso = startOfLocalDay(nextFire).toLocaleDateString('en-CA');
  const targetDayIso = startOfLocalDay(params.targetDate).toLocaleDateString('en-CA');
  const daysLeft = getCalendarDaysDiff(fireDayIso, targetDayIso);

  const { title, body } = getDailyReminderCopy(daysLeft, params.goalTitle, params.streakCount);

  const notificationId = `${NOTIF_ID_DAILY}-${params.goalId}`;

  try {
    await notifee.createTriggerNotification(
      {
        id: notificationId,
        title,
        body,
        data: { screen: 'Capture', type: 'daily_reminder' } as Record<string, string>,
        android: {
          channelId: CHANNEL_IDS.DAILY_REMINDER,
          pressAction: { id: 'default' },
        },
        ios: { sound: 'default' },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: nextFire.getTime(),
        alarmManager: { allowWhileIdle: true },
      },
    );
    setScheduledIds([notificationId]);
  } catch (e) {
    console.error('[scheduleDaily] createTriggerNotification failed', e);
  }
}

/**
 * Read persisted reminder hour (MMKV) or default.
 */
export function getPreferredReminderHour(): number {
  const n = storage.getNumber(MMKV_KEYS.notifReminderHour);
  if (n === undefined) return DEFAULT_REMINDER_HOUR;
  const h = Math.floor(n);
  if (h < 0 || h > 23) return DEFAULT_REMINDER_HOUR;
  return h;
}

export function setPreferredReminderHour(hour: number): void {
  const h = Math.max(0, Math.min(23, Math.floor(hour)));
  storage.set(MMKV_KEYS.notifReminderHour, h);
}
