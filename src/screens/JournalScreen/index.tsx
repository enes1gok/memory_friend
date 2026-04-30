import { CommonActions, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { type Database, Q } from '@nozbe/watermelondb';
import { withDatabase, withObservables } from '@nozbe/watermelondb/react';
import type { ComponentType } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, SectionList, View } from 'react-native';
import { of } from 'rxjs';

import { EmptyState } from '@/components/EmptyState';
import { Caption, Heading } from '@/components/Typography';
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

type JournalSection = {
  title: string;
  data: JournalEntry[];
};

function dateKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function sectionTitle(date: Date, language: string, t: (key: string) => string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const key = dateKey(date);
  if (key === today.toISOString()) {
    return t('journal.sections.today');
  }
  if (key === yesterday.toISOString()) {
    return t('journal.sections.yesterday');
  }
  return date.toLocaleDateString(language, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function JournalListView({ entries, activeGoalId }: ListProps) {
  const { t, i18n } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
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

  const sections = useMemo<JournalSection[]>(() => {
    const grouped = new Map<string, JournalEntry[]>();
    for (const entry of entries) {
      const key = dateKey(entry.capturedAt);
      const bucket = grouped.get(key) ?? [];
      bucket.push(entry);
      grouped.set(key, bucket);
    }
    return Array.from(grouped.entries()).map(([key, data]) => ({
      title: sectionTitle(new Date(key), i18n.language, t),
      data,
    }));
  }, [entries, i18n.language, t]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 350);
  }, []);

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
        <SectionList
          testID="journal:list"
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <JournalEntryCard entry={item} />}
          renderSectionHeader={({ section }) => (
            <Caption className="mb-2 mt-4 uppercase tracking-wide text-muted">{section.title}</Caption>
          )}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f5f5f5" />}
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
