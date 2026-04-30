import notifee, { AuthorizationStatus } from '@notifee/react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, type AppStateStatus, Linking } from 'react-native';

import { canScheduleNotification } from '../logic/policy';
import { storage } from '@/utils/mmkv';
import { MMKV_KEYS } from '@/utils/mmkvKeys';

/**
 * App notification settings: read, request, refresh, and open system settings.
 */
export function useNotificationPermission() {
  const [authorizationStatus, setAuthorizationStatus] = useState<AuthorizationStatus | undefined>();

  const refresh = useCallback(async (): Promise<AuthorizationStatus | undefined> => {
    try {
      const s = await notifee.getNotificationSettings();
      const next = s.authorizationStatus;
      setAuthorizationStatus(next);
      return next;
    } catch (e) {
      console.warn('[useNotificationPermission] getNotificationSettings', e);
      return undefined;
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    let last: AppStateStatus = AppState.currentState;
    const sub = AppState.addEventListener('change', (next) => {
      if (last.match(/inactive|background/) && next === 'active') {
        void refresh();
      }
      last = next;
    });
    return () => sub.remove();
  }, [refresh]);

  const hasAskedBefore = storage.getBoolean(MMKV_KEYS.notifPermissionAsked) === true;

  const request = useCallback(async () => {
    const next = await notifee.requestPermission();
    storage.set(MMKV_KEYS.notifPermissionAsked, true);
    setAuthorizationStatus(next.authorizationStatus);
    return next.authorizationStatus;
  }, []);

  const openSettings = useCallback(() => {
    void Linking.openSettings();
  }, []);

  const canSchedule = useMemo(() => {
    if (authorizationStatus === undefined) {
      return false;
    }
    return canScheduleNotification(authorizationStatus);
  }, [authorizationStatus]);

  const isDenied = authorizationStatus === AuthorizationStatus.DENIED;

  return {
    /** Latest authorization; undefined until first read completes. */
    authorizationStatus,
    hasAskedBefore,
    request,
    refresh,
    openSettings,
    /** True once settings read resolves and Notifee allows scheduling. */
    canSchedule,
    /** True when OS reports denied (prompt again may not appear). Offer settings when appropriate. */
    isDenied,
  };
}
