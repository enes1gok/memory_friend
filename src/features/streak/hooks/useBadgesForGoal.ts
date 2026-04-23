import { Q } from '@nozbe/watermelondb';
import { useDatabase } from '@nozbe/watermelondb/react';
import { useEffect, useMemo, useState } from 'react';

import type { Badge } from '@/models/Badge';

import { isBadgeTypeId, type BadgeTypeId } from '../constants/badgeTypes';

export function useBadgesForGoal(activeGoalId: string | null): {
  earnedIds: BadgeTypeId[];
  badges: Badge[];
  isHydrating: boolean;
} {
  const database = useDatabase();
  const [rows, setRows] = useState<Badge[] | undefined>(undefined);

  useEffect(() => {
    if (!activeGoalId) {
      setRows([]);
      return;
    }

    setRows(undefined);
    const sub = database
      .get<Badge>('badges')
      .query(Q.where('goal_id', activeGoalId), Q.sortBy('awarded_at', Q.asc))
      .observe()
      .subscribe(setRows);

    return () => sub.unsubscribe();
  }, [activeGoalId, database]);

  return useMemo(() => {
    if (!activeGoalId) {
      return { earnedIds: [], badges: [], isHydrating: false };
    }
    if (rows === undefined) {
      return { earnedIds: [], badges: [], isHydrating: true };
    }
    const earnedIds: BadgeTypeId[] = [];
    for (const b of rows) {
      if (isBadgeTypeId(b.badgeType)) {
        earnedIds.push(b.badgeType);
      }
    }
    return { earnedIds, badges: rows, isHydrating: false };
  }, [activeGoalId, rows]);
}
