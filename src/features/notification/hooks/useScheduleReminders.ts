import notifee, { AuthorizationStatus } from '@notifee/react-native';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { useActiveGoal } from '@/features/streak/hooks/useActiveGoal';
import { cancelAllReminders } from '../logic/cancelReminders';
import { getPreferredReminderHour, scheduleOrReschedule } from '../logic/scheduleDaily';
import { storage } from '@/utils/mmkv';
import { MMKV_KEYS } from '@/utils/mmkvKeys';

function isAuthorizedForSchedule(status: AuthorizationStatus): boolean {
  return status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;
}

/**
 * Keeps the next daily reminder aligned with the active goal, streak cache, and reminder hour.
 * Resyncs when the app returns to the foreground.
 */
export function useScheduleReminders() {
  const goal = useActiveGoal();
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const targetTime = goal?.targetDate?.getTime();

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      if (goal === undefined) {
        return;
      }
      if (goal === null || goal.isCompleted) {
        await cancelAllReminders();
        return;
      }

      const settings = await notifee.getNotificationSettings();
      if (cancelled) {
        return;
      }
      if (!isAuthorizedForSchedule(settings.authorizationStatus)) {
        return;
      }

      const streak = storage.getNumber(MMKV_KEYS.streakCurrentCount) ?? 0;
      const hour = getPreferredReminderHour();
      await scheduleOrReschedule({
        goalId: goal.id,
        goalTitle: goal.title,
        targetDate: goal.targetDate,
        reminderHour: hour,
        streakCount: streak,
      });
    }

    void sync();

    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        void sync();
      }
      appState.current = next;
    });

    return () => {
      cancelled = true;
      sub.remove();
    };
  }, [goal, goal?.id, goal?.isCompleted, goal?.title, targetTime]);
}
