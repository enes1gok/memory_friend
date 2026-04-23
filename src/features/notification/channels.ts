import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

import i18n from '@/i18n';

export const CHANNEL_IDS = {
  /** Check-in and journey reminders. */
  DAILY_REMINDER: 'daily-reminder',
} as const;

/**
 * Android notification channels. Safe to call on iOS (no-op on channel creation for iOS).
 */
export async function ensureChannels(): Promise<void> {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: CHANNEL_IDS.DAILY_REMINDER,
      name: i18n.t('notifications.channels.dailyReminder'),
      importance: AndroidImportance.DEFAULT,
    });
  }
}
