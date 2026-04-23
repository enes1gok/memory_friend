import { Q } from '@nozbe/watermelondb';
import { useDatabase } from '@nozbe/watermelondb/react';
import { useEffect, useState } from 'react';

import type { Goal } from '@/models/Goal';
import { useGoalStore } from '@/stores/useGoalStore';

/** Observes the active goal row from WatermelonDB. */
export function useActiveGoal(): Goal | null | undefined {
  const database = useDatabase();
  const activeGoalId = useGoalStore((s) => s.activeGoalId);
  const [goal, setGoal] = useState<Goal | null | undefined>(undefined);

  useEffect(() => {
    if (!activeGoalId) {
      setGoal(null);
      return;
    }

    setGoal(undefined);
    const sub = database
      .get<Goal>('goals')
      .query(Q.where('id', activeGoalId))
      .observe()
      .subscribe((rows) => {
        setGoal(rows[0] ?? null);
      });

    return () => sub.unsubscribe();
  }, [activeGoalId, database]);

  return goal;
}
