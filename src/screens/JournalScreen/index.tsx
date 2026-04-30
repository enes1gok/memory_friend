import { CommonActions, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { type Database, Q } from '@nozbe/watermelondb';
import { withDatabase, withObservables } from '@nozbe/watermelondb/react';
import type { ComponentType } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';
import { of } from 'rxjs';

import { EmptyState } from '@/components/EmptyState';
import { Heading } from '@/components/Typography';
import { SafeScreen } from '@/components/SafeScreen';
import { JournalEntryCard } from '@/features/journal/components/JournalEntryCard';
import type { JournalEntry } from '@/models/JournalEntry';
import type { RootStackParamList, TabParamList } from '@/navigation/types';
import { useGoalStore } from '@/stores/useGoalStore';

type ListProps = {
  entries: JournalEntry[];
  activeGoalId: string | null;
  database?: Database;
};

function JournalListView({ entries, activeGoalId }: ListProps) {
  const { t } = useTranslation();
  const tabNav = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const rootNav = tabNav.getParent<NativeStackNavigationProp<RootStackParamList>>();

  const goOnboarding = useCallback(() => {
    rootNav?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      }),
    );
  }, [rootNav]);

  const openCapture = useCallback(() => {
    tabNav.navigate('Capture');
  }, [tabNav]);

  if (!activeGoalId) {
    return (
      <SafeScreen testID="journal:screen:root">
        <EmptyState
          testID="journal:empty:no-goal"
          title={t('journal.noGoal.title')}
          body={t('journal.noGoal.body')}
          ctaLabel={t('journal.noGoal.cta')}
          onCtaPress={goOnboarding}
        />
      </SafeScreen>
    );
  }

  if (entries.length === 0) {
    return (
      <SafeScreen testID="journal:screen:root">
        <EmptyState
          testID="journal:empty:no-entries"
          title={t('journal.empty.title')}
          body={t('journal.empty.body')}
          ctaLabel={t('journal.empty.cta')}
          onCtaPress={openCapture}
        />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen testID="journal:screen:root">
      <View className="flex-1 px-4 pt-4">
        <Heading className="mb-1 px-1 text-2xl">{t('journal.listTitle')}</Heading>
        <FlatList
          testID="journal:list"
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <JournalEntryCard entry={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
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
