import notifee, { EventType } from '@notifee/react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';

import { NOTIFICATION_DATA_TYPE, parseNotificationData } from '../logic/payloads';
import type { RootStackParamList } from '@/navigation/types';

/**
 * Cold start + foreground notification press: navigates according to typed `data` payload.
 * Mount from TabNavigator so `getParent` reaches the root stack (includes `Capture` modal).
 */
export function useNotificationResponseHandler() {
  const nav = useNavigation();
  const rootNav = nav.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const rootNavRef = useRef(rootNav);
  rootNavRef.current = rootNav;

  useEffect(() => {
    const handle = (parsed: NonNullable<ReturnType<typeof parseNotificationData>>) => {
      const root = rootNavRef.current;
      if (!root) return;
      switch (parsed.type) {
        case NOTIFICATION_DATA_TYPE.DAILY_REMINDER:
          root.navigate('Capture');
          break;
        case NOTIFICATION_DATA_TYPE.CAPSULE_UNLOCK:
          root.navigate('CapsuleReveal', { capsuleId: parsed.capsuleId });
          break;
        case NOTIFICATION_DATA_TYPE.AI_COMPANION:
          root.navigate('MainTabs', { screen: 'Home' });
          break;
      }
    };

    void notifee.getInitialNotification().then((initial) => {
      const parsed = parseNotificationData(
        initial?.notification?.data as Record<string, unknown> | undefined,
      );
      if (!parsed) {
        return;
      }
      requestAnimationFrame(() => {
        handle(parsed);
      });
    });

    return notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        const parsed = parseNotificationData(
          detail.notification?.data as Record<string, unknown> | undefined,
        );
        if (parsed) handle(parsed);
      }
    });
  }, []);
}
