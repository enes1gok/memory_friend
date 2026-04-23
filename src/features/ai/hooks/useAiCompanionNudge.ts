import { Q } from '@nozbe/watermelondb';
import { useDatabase } from '@nozbe/watermelondb/react';
import { useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import { scheduleCompanionNudge } from '@/features/notification/logic/scheduleCompanionNudge';
import { useActiveGoal } from '@/features/streak/hooks/useActiveGoal';
import type { AiEnrichment } from '@/models/AiEnrichment';
import type { JournalEntry } from '@/models/JournalEntry';

import { detectRepeatedStress, type EmotionRow } from '../logic/detectRepeatedStress';

/**
 * On foreground, checks recent journal + AI tags for a repeated stress run and schedules a gentle nudge (deduped per day in {@link scheduleCompanionNudge}).
 */
export function useAiCompanionNudge() {
  const goal = useActiveGoal();
  const database = useDatabase();
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const run = useCallback(async () => {
    if (goal === undefined || goal === null || goal.isCompleted) {
      return;
    }
    const goalId = goal.id;

    const entries = await database
      .get<JournalEntry>('journal_entries')
      .query(Q.where('goal_id', goalId), Q.sortBy('captured_at', Q.desc))
      .fetch();
    if (entries.length < 3) {
      return;
    }

    const last3 = entries.slice(0, 3).reverse();
    const enrCol = database.get<AiEnrichment>('ai_enrichments');

    const rowPayload: EmotionRow[] = await Promise.all(
      last3.map(async (e) => {
        const r = await enrCol.query(Q.where('journal_entry_id', e.id)).fetch();
        const en = r[0];
        return { emotionTags: en?.emotionTags ?? [] };
      }),
    );

    const { triggered } = detectRepeatedStress(rowPayload);
    if (!triggered) {
      return;
    }

    await scheduleCompanionNudge({ goalId });
  }, [database, goal]);

  useEffect(() => {
    if (goal === undefined) {
      return;
    }
    void run();

    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        void run();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, [goal, goal?.id, run]);
}
