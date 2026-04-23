import notifee, { AuthorizationStatus } from '@notifee/react-native';
import { useCallback, useEffect, useState } from 'react';

import { storage } from '@/utils/mmkv';
import { MMKV_KEYS } from '@/utils/mmkvKeys';

/**
 * App notification settings + a single entry point to request permission (onboarding or settings).
 */
export function useNotificationPermission() {
  const [authorizationStatus, setAuthorizationStatus] = useState<AuthorizationStatus | undefined>();

  useEffect(() => {
    void notifee
      .getNotificationSettings()
      .then((s) => {
        setAuthorizationStatus(s.authorizationStatus);
      })
      .catch((e) => {
        console.warn('[useNotificationPermission] getNotificationSettings', e);
      });
  }, []);

  const hasAskedBefore = storage.getBoolean(MMKV_KEYS.notifPermissionAsked) === true;

  const request = useCallback(async () => {
    const next = await notifee.requestPermission();
    storage.set(MMKV_KEYS.notifPermissionAsked, true);
    setAuthorizationStatus(next.authorizationStatus);
    return next.authorizationStatus;
  }, []);

  return {
    /** Latest authorization; undefined until first read completes. */
    authorizationStatus,
    hasAskedBefore,
    request,
  };
}
