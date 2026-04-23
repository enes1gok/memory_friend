import type { TFunction } from 'i18next';

import i18n from '@/i18n';

export type DailyReminderCopy = {
  titleKey: string;
  bodyKey: string;
};

/**
 * Picks i18n keys for daily reminder copy based on calendar days until target.
 * Buckets: early (>14), mid (8-14), final stretch (1-7), target day (0).
 */
export function getDailyReminderCopyKeys(daysLeft: number): DailyReminderCopy {
  if (daysLeft <= 0) {
    return {
      titleKey: 'notifications.daily.targetDayTitle',
      bodyKey: 'notifications.daily.targetDayBody',
    };
  }
  if (daysLeft >= 1 && daysLeft <= 7) {
    return {
      titleKey: 'notifications.daily.finalStretchTitle',
      bodyKey: 'notifications.daily.finalStretchBody',
    };
  }
  if (daysLeft >= 8 && daysLeft <= 14) {
    return {
      titleKey: 'notifications.daily.midTitle',
      bodyKey: 'notifications.daily.midBody',
    };
  }
  return {
    titleKey: 'notifications.daily.earlyTitle',
    bodyKey: 'notifications.daily.earlyBody',
  };
}

export function resolveDailyReminderStrings(
  t: TFunction,
  daysLeft: number,
  goalName: string,
  streak: number,
): { title: string; body: string } {
  const { titleKey, bodyKey } = getDailyReminderCopyKeys(daysLeft);
  return {
    title: t(titleKey, { goalName, streak, count: streak }),
    body: t(bodyKey, { goalName, streak, count: streak }),
  };
}

/** Empathetic title + body for the next daily reminder (goal distance aware). */
export function getDailyReminderCopy(
  daysLeft: number,
  goalName: string,
  streak: number,
): { title: string; body: string } {
  return resolveDailyReminderStrings(i18n.t, daysLeft, goalName, streak);
}
