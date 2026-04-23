import notifee, { EventType } from '@notifee/react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useRef } from 'react';

import type { RootStackParamList } from '@/navigation/types';

/**
 * Opens CapsuleReveal when a capsule unlock notification is pressed (foreground + initial).
 * Mount from TabNavigator so the parent is the root stack.
 */
export function useCapsuleNotificationHandler() {
  const nav = useNavigation();
  const rootNav = nav.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const rootNavRef = useRef(rootNav);
  rootNavRef.current = rootNav;

  useEffect(() => {
    const open = (capsuleId: string) => {
      rootNavRef.current?.navigate('CapsuleReveal', { capsuleId });
    };

    void notifee.getInitialNotification().then((initial) => {
      const data = initial?.notification?.data;
      if (data?.type === 'capsule_unlock' && data?.capsuleId) {
        open(String(data.capsuleId));
      }
    });

    return notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {
        const data = detail.notification?.data;
        if (data?.type === 'capsule_unlock' && data?.capsuleId) {
          open(String(data.capsuleId));
        }
      }
    });
  }, []);
}
