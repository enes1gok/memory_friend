import { Q } from '@nozbe/watermelondb';
import { useDatabase } from '@nozbe/watermelondb/react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

import { AppCard } from '@/components/AppCard';
import { Body, Heading } from '@/components/Typography';
import type { AiEnrichment } from '@/models/AiEnrichment';
import type { JournalEntry } from '@/models/JournalEntry';

type Props = {
  activeGoalId: string | null;
};

/**
 * Latest companion line from `ai_enrichments` for this goal, by most recent journal entry.
 */
export function CompanionCard({ activeGoalId }: Props) {
  const { t } = useTranslation();
  const database = useDatabase();
  const [companion, setCompanion] = useState<string | null>(null);

  useEffect(() => {
    if (!activeGoalId) {
      setCompanion(null);
      return;
    }
    const sub = database
      .get<JournalEntry>('journal_entries')
      .query(Q.where('goal_id', activeGoalId), Q.sortBy('captured_at', Q.desc))
      .observe()
      .subscribe((entries) => {
        void (async () => {
          const enr = database.get<AiEnrichment>('ai_enrichments');
          for (const e of entries) {
            const rows = await enr.query(Q.where('journal_entry_id', e.id)).fetch();
            const msg = rows[0]?.companionMessage;
            if (msg) {
              setCompanion(msg);
              return;
            }
          }
          setCompanion(null);
        })();
      });
    return () => sub.unsubscribe();
  }, [activeGoalId, database]);

  if (!activeGoalId) {
    return null;
  }
  if (companion == null || companion.length === 0) {
    return null;
  }

  return (
    <AppCard testID="home:ai:companion:card" accessibilityLabel={`${t('ai.companion.title')}. ${companion}`}>
      <Heading className="mb-2 text-lg">{t('ai.companion.title')}</Heading>
      <Body className="leading-relaxed text-secondary">{companion}</Body>
    </AppCard>
  );
}
