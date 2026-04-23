import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { Body, Heading } from '@/components/Typography';
import { SafeScreen } from '@/components/SafeScreen';
import { CompanionCard, HypeManModal } from '@/features/ai';
import { CapsuleCard } from '@/features/capsule/components/CapsuleCard';
import { useCapsulesByGoal } from '@/features/capsule/hooks/useCapsulesByGoal';
import {
  BadgeRow,
  EmotionHeatmap,
  StreakCounter,
  useActiveGoal,
} from '@/features/streak';
import type { RootStackParamList } from '@/navigation/types';
import { useGoalStore } from '@/stores/useGoalStore';
import { useUIStore } from '@/stores/useUIStore';

function daysUntilTargetEnd(target: Date): number {
  const end = new Date(target);
  end.setHours(23, 59, 59, 999);
  const ms = end.getTime() - Date.now();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

export function HomeScreen() {
  const { t } = useTranslation();
  const activeGoalId = useGoalStore((s) => s.activeGoalId);
  const goal = useActiveGoal();
  const tabNav = useNavigation();
  const rootNav = tabNav.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const capsules = useCapsulesByGoal(activeGoalId);
  const [hypeOpen, setHypeOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const { hypeManFromCapturePending, setHypeManFromCapturePending } = useUIStore.getState();
      if (hypeManFromCapturePending) {
        setHypeOpen(true);
        setHypeManFromCapturePending(false);
      }
    }, []),
  );

  if (!activeGoalId) {
    return (
      <SafeScreen testID="home:screen:root">
        <View className="flex-1 justify-center px-6">
          <Heading className="mb-2">{t('home.noGoal.title')}</Heading>
          <Body className="text-slate-400">{t('home.noGoal.body')}</Body>
        </View>
      </SafeScreen>
    );
  }

  if (goal === undefined) {
    return (
      <SafeScreen testID="home:screen:root">
        <View className="flex-1 justify-center px-6">
          <Body className="text-slate-400">{t('common.loading')}</Body>
        </View>
      </SafeScreen>
    );
  }

  if (goal === null) {
    return (
      <SafeScreen testID="home:screen:root">
        <View className="flex-1 justify-center px-6">
          <Heading className="mb-2">{t('home.missingGoal.title')}</Heading>
          <Body className="text-slate-400">{t('home.missingGoal.body')}</Body>
        </View>
      </SafeScreen>
    );
  }

  const daysLeft = daysUntilTargetEnd(goal.targetDate);

  return (
    <SafeScreen testID="home:screen:root">
      <ScrollView
        className="flex-1 px-4 pt-2"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Heading className="mb-1 px-2 text-2xl" accessibilityRole="header">
          {goal.title}
        </Heading>
        <Body className="mb-4 px-2 text-slate-400">
          {daysLeft <= 0
            ? t('home.targetDay')
            : t('home.daysLeft', { count: Math.max(1, daysLeft) })}
        </Body>

        <View className="gap-4">
          <StreakCounter activeGoalId={activeGoalId} />
          <CompanionCard activeGoalId={activeGoalId} />
          <EmotionHeatmap activeGoalId={activeGoalId} />
          <BadgeRow activeGoalId={activeGoalId} />
        </View>

        <View className="mt-8">
          <Heading className="mb-2 px-2 text-lg">{t('capsule.list.title')}</Heading>
          {capsules.length === 0 ? (
            <Body className="mb-4 px-2 text-slate-500">{t('capsule.list.empty')}</Body>
          ) : (
            <View className="mb-3">
              {capsules.map((c) => (
                <CapsuleCard
                  key={c.id}
                  capsule={c}
                  onView={(id) => {
                    rootNav?.navigate('CapsuleReveal', { capsuleId: id });
                  }}
                />
              ))}
            </View>
          )}
          <Pressable
            testID="home:capsule:create-cta"
            onPress={() => {
              if (activeGoalId) {
                rootNav?.navigate('CapsuleCreate', { goalId: activeGoalId });
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={t('capsule.list.createCta')}
            className="items-center rounded-2xl border border-orange-500/40 bg-orange-500/10 py-4"
          >
            <Body className="font-semibold text-orange-300">{t('capsule.list.createCta')}</Body>
          </Pressable>
        </View>
      </ScrollView>

      <HypeManModal
        visible={hypeOpen}
        activeGoalId={activeGoalId}
        onDismiss={() => {
          setHypeOpen(false);
        }}
      />
    </SafeScreen>
  );
}
