import { Q } from '@nozbe/watermelondb';
import { useDatabase } from '@nozbe/watermelondb/react';
import { useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import type { Capsule } from '@/models/Capsule';

import { unlockDueCapsulesForGoal } from '../logic/unlockCapsule';

/**
 * Live list of capsules for the active goal, sorted newest first. Unlocks past-due rows in background + on foreground.
 */
export function useCapsulesByGoal(goalId: string | null): Capsule[] {
  const database = useDatabase();
  const [list, setList] = useState<Capsule[]>([]);

  useEffect(() => {
    if (!goalId) {
      setList([]);
      return;
    }

    const runUnlock = () => {
      void unlockDueCapsulesForGoal(database, goalId, new Date());
    };

    runUnlock();

    const sub = database
      .get<Capsule>('capsules')
      .query(Q.where('goal_id', goalId), Q.sortBy('created_at', Q.desc))
      .observe()
      .subscribe((rows) => {
        setList(rows);
        void unlockDueCapsulesForGoal(database, goalId, new Date());
      });

    const appState = { current: AppState.currentState as AppStateStatus };
    const asSub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        runUnlock();
      }
      appState.current = next;
    });

    return () => {
      sub.unsubscribe();
      asSub.remove();
    };
  }, [goalId, database]);

  return list;
}
