/**
 * Typed Notifee `data` payloads for navigation and auditing.
 * All values must be strings for Notifee (see builders below).
 */

export const NOTIFICATION_DATA_TYPE = {
  DAILY_REMINDER: 'daily_reminder',
  CAPSULE_UNLOCK: 'capsule_unlock',
  AI_COMPANION: 'ai_companion',
} as const;

export type NotificationDataType = (typeof NOTIFICATION_DATA_TYPE)[keyof typeof NOTIFICATION_DATA_TYPE];

export type ParsedNotificationData =
  | { type: typeof NOTIFICATION_DATA_TYPE.DAILY_REMINDER; screen: 'Capture'; goalId?: string }
  | { type: typeof NOTIFICATION_DATA_TYPE.CAPSULE_UNLOCK; screen: 'CapsuleReveal'; capsuleId: string }
  | { type: typeof NOTIFICATION_DATA_TYPE.AI_COMPANION; screen: 'Home'; goalId?: string };

export function buildDailyReminderData(params: { goalId: string }): Record<string, string> {
  return {
    type: NOTIFICATION_DATA_TYPE.DAILY_REMINDER,
    screen: 'Capture',
    goalId: params.goalId,
  };
}

export function buildCapsuleUnlockData(params: { capsuleId: string }): Record<string, string> {
  return {
    type: NOTIFICATION_DATA_TYPE.CAPSULE_UNLOCK,
    screen: 'CapsuleReveal',
    capsuleId: params.capsuleId,
  };
}

export function buildAiCompanionData(params: { goalId?: string }): Record<string, string> {
  const base: Record<string, string> = {
    type: NOTIFICATION_DATA_TYPE.AI_COMPANION,
    screen: 'Home',
  };
  if (params.goalId) {
    base.goalId = params.goalId;
  }
  return base;
}

function readString(map: Record<string, unknown>, key: string): string | undefined {
  const v = map[key];
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

/**
 * Parses Notifee notification `data` for known app types; returns null if unknown or invalid.
 */
export function parseNotificationData(
  data: Record<string, unknown> | undefined,
): ParsedNotificationData | null {
  if (data == null) {
    return null;
  }
  const type = readString(data, 'type');
  if (type === NOTIFICATION_DATA_TYPE.DAILY_REMINDER) {
    const goalId = readString(data, 'goalId');
    return { type, screen: 'Capture', ...(goalId ? { goalId } : {}) };
  }
  if (type === NOTIFICATION_DATA_TYPE.CAPSULE_UNLOCK) {
    const capsuleId = readString(data, 'capsuleId');
    if (!capsuleId) return null;
    return { type, screen: 'CapsuleReveal', capsuleId };
  }
  if (type === NOTIFICATION_DATA_TYPE.AI_COMPANION) {
    const goalId = readString(data, 'goalId');
    return { type, screen: 'Home', ...(goalId ? { goalId } : {}) };
  }
  return null;
}
