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

  /** logout — JSON map of capsule id → notif id for capsule unlock triggers. */
  capsuleScheduledIds: 'capsule:scheduledIds',

  /** device — YYYY-MM-DD (local) of last scheduled AI companion nudge. */
  aiLastNudgeDate: 'ai:lastNudgeDate',

  /** device — last journal entry id that triggered companion nudge dedup. */
  aiLastEnrichmentContextId: 'ai:lastEnrichmentContextId',

  /** device — last exported collage video path (file URI); rebuild by re-running export. */
  collageExportPath: 'collage:exportPath',

  /** logout — goal id the cached collage export belongs to. */
  collageGeneratedForGoalId: 'collage:generatedForGoalId',
} as const;
