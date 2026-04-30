import { AuthorizationStatus } from '@notifee/react-native';

/**
 * Default quiet policy (local wall clock) until user prefs replace it.
 * Eligible hours: [{QUIET_BEFORE_HOUR}] through [{QUIET_AFTER_HOUR}] inclusive.
 * Replace with persisted start/end when settings exist (see .cursor/rules/notification-system.mdc).
 */
export const QUIET_BEFORE_HOUR = 9;
export const QUIET_AFTER_HOUR = 20;

/** True when hour 0–23 is outside the eligible reminder window (before 9 or after 20). */
export function isHourInQuietWindow(hour: number): boolean {
  return hour < QUIET_BEFORE_HOUR || hour > QUIET_AFTER_HOUR;
}

/**
 * Alias for callers that historically used `isInQuietHours` naming.
 * Same as `isHourInQuietWindow`.
 */
export function isInQuietHours(hour: number): boolean {
  return isHourInQuietWindow(hour);
}

/**
 * Maps a preferred reminder hour into the eligible window so daily reminders still schedule
 * instead of silently skipping (e.g. 7 → 9, 22 → 20).
 */
export function clampReminderHourToEligibleWindow(hour: number): number {
  if (hour < QUIET_BEFORE_HOUR) return QUIET_BEFORE_HOUR;
  if (hour > QUIET_AFTER_HOUR) return QUIET_AFTER_HOUR;
  return hour;
}

export function canScheduleNotification(status: AuthorizationStatus): boolean {
  return status === AuthorizationStatus.AUTHORIZED || status === AuthorizationStatus.PROVISIONAL;
}

/** True when the local time of `d` falls in the quiet window (before 9 or after 20). */
export function isDateTimeInQuietWindow(d: Date): boolean {
  const h = d.getHours();
  return isHourInQuietWindow(h);
}

/**
 * Shifts `unlocksAt` into the eligible window: before 9 → 9:00 same day; after 20 → 9:00 next day.
 * Then ensures strictly after `now` (min +1 minute). Used for capsule delivery fire time.
 */
export function adjustUnlockDateOutOfQuietWindow(unlocksAt: Date, now: Date = new Date()): Date {
  const d = new Date(unlocksAt);
  const h = d.getHours();
  if (h < QUIET_BEFORE_HOUR) {
    d.setHours(QUIET_BEFORE_HOUR, 0, 0, 0);
  } else if (h > QUIET_AFTER_HOUR) {
    d.setDate(d.getDate() + 1);
    d.setHours(QUIET_BEFORE_HOUR, 0, 0, 0);
  }
  if (d.getTime() <= now.getTime()) {
    return new Date(now.getTime() + 60_000);
  }
  return d;
}
