/**
 * Central MMKV key registry. Values should be rebuildable from WatermelonDB + files if wiped.
 *
 * Scope:
 * - `device`: safe to keep across sessions on this device.
 * - `logout`: clear on sign-out / account switch (rebuild from DB where noted).
 */
export const MMKV_KEYS = {
  /** device — last foreground / open timestamp (ms). */
  lastAppOpenAt: 'session:lastAppOpenAt',

  /** logout — active goal id; source of truth is `goals` table. */
  activeGoalId: 'goal:activeGoalId',

  /** logout — denormalized countdown for fast home UI; rebuild from goal target date. */
  goalCountdownMs: 'goal:countdownMs',

  /** logout — denormalized streak count; source of truth is `streak_state`. */
  streakCurrentCount: 'streak:currentCount',

  /** logout — last check-in calendar day (ISO date string); source of truth is `streak_state`. */
  streakLastCheckIn: 'streak:lastCheckInDate',

  /** logout — local hour 0-23 for daily reminder; default 20 in code if unset. */
  notifReminderHour: 'notification:reminderHour',

  /** device — true once we have prompted for notification permission. */
  notifPermissionAsked: 'notification:permissionAsked',

  /** logout — JSON string array of Notifee notification ids to cancel on reschedule. */
  notifScheduledIds: 'notification:scheduledIds',
} as const;
