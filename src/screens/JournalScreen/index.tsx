import { type Database, Q } from '@nozbe/watermelondb';
import { withDatabase, withObservables } from '@nozbe/watermelondb/react';
import type { ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import { of } from 'rxjs';

import { Body, Heading } from '@/components/Typography';
import { SafeScreen } from '@/components/SafeScreen';
import { JournalEntryCard } from '@/features/journal/components/JournalEntryCard';
import type { JournalEntry } from '@/models/JournalEntry';
import { useGoalStore } from '@/stores/useGoalStore';

type ListProps = {
  entries: JournalEntry[];
  activeGoalId: string | null;
  database?: Database;
};

function JournalListView({ entries, activeGoalId }: ListProps) {
  const { t } = useTranslation();

  if (!activeGoalId) {
    return (
      <SafeScreen testID="journal:screen:root">
        <View className="flex-1 justify-center px-6">
          <Heading className="mb-2">{t('journal.noGoal.title')}</Heading>
          <Body className="text-slate-400">{t('journal.noGoal.body')}</Body>
        </View>
      </SafeScreen>
    );
  }

  if (entries.length === 0) {
    return (
      <SafeScreen testID="journal:screen:root">
        <View className="flex-1 justify-center px-6">
          <Heading className="mb-2">{t('journal.empty.title')}</Heading>
          <Body className="text-slate-400">{t('journal.empty.body')}</Body>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen testID="journal:screen:root">
      <View className="flex-1 px-4 pt-2">
        <Heading className="mb-4 px-2">{t('journal.listTitle')}</Heading>
        <FlatList
          testID="journal:list"
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <JournalEntryCard entry={item} />}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeScreen>
  );
}

const JournalListWithObservables = withObservables(
  ['activeGoalId'],
  ({ database, activeGoalId }: { database: Database; activeGoalId: string | null }) => {
    if (!activeGoalId) {
      return { entries: of([] as JournalEntry[]) };
    }
    return {
      entries: database
        .get<JournalEntry>('journal_entries')
        .query(Q.where('goal_id', activeGoalId), Q.sortBy('captured_at', Q.desc)),
    };
  },
)(JournalListView);

const JournalListEnhanced = withDatabase(JournalListWithObservables) as ComponentType<{
  activeGoalId: string | null;
}>;

export function JournalScreen() {
  const activeGoalId = useGoalStore((s) => s.activeGoalId);
  return <JournalListEnhanced activeGoalId={activeGoalId} />;
}
