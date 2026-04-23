import { useDatabase } from '@nozbe/watermelondb/react';
import { useCallback } from 'react';

import { unlockCapsuleId } from '../logic/unlockCapsule';

export function useUnlockCapsule() {
  const database = useDatabase();

  return useCallback(
    (capsuleId: string) => unlockCapsuleId(database, capsuleId, new Date()),
    [database],
  );
}
