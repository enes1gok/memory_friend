import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { AppCard } from '@/components/AppCard';
import { EmptyState } from '@/components/EmptyState';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SafeScreen } from '@/components/SafeScreen';
import { SectionHeader } from '@/components/SectionHeader';
import { Body, Caption, Display, Heading } from '@/components/Typography';
import { CompanionCard, HypeManModal } from '@/features/ai';
import { CapsuleCard } from '@/features/capsule/components/CapsuleCard';
import { useCapsulesByGoal } from '@/features/capsule/hooks/useCapsulesByGoal';
import {
  BadgeRow,
  EmotionHeatmap,
  JourneyProgressCard,
  StreakCounter,
  useActiveGoal,
} from '@/features/streak';
import type { Goal } from '@/models/Goal';
import type { RootStackParamList, TabParamList } from '@/navigation/types';
import { useGoalStore } from '@/stores/useGoalStore';
import { useUIStore } from '@/stores/useUIStore';
import { getAccentColor } from '@/theme/accent';

function daysUntilTargetEnd(target: Date): number {
  const end = new Date(target);
  end.setHours(23, 59, 59, 999);
  const ms = end.getTime() - Date.now();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

function accentProgressForGoal(goal: Goal): number {
  const start = goal.startDate.getTime();
  const end = goal.targetDate.getTime();
  const now = Date.now();
  if (end <= start) {
    return 1;
  }
  return Math.min(1, Math.max(0, (now - start) / (end - start)));
}

export function HomeScreen() {
  const { t } = useTranslation();
  const activeGoalId = useGoalStore((s) => s.activeGoalId);
  const goal = useActiveGoal();
  const tabNav = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const rootNav = tabNav.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const capsules = useCapsulesByGoal(activeGoalId);
  const [hypeOpen, setHypeOpen] = useState(false);
  const setAccentProgress = useUIStore((s) => s.setAccentProgress);

  const goalProgress = useMemo(() => {
    if (goal == null || goal === undefined) {
      return 0;
    }
    return accentProgressForGoal(goal);
  }, [goal]);

  useEffect(() => {
    if (goal != null && goal !== undefined) {
      setAccentProgress(goalProgress);
    }
  }, [goal, goalProgress, setAccentProgress]);

  const accentTint = getAccentColor(goalProgress);

  useFocusEffect(
    useCallback(() => {
      const { hypeManFromCapturePending, setHypeManFromCapturePending } = useUIStore.getState();
      if (hypeManFromCapturePending) {
        setHypeOpen(true);
        setHypeManFromCapturePending(false);
      }
    }, []),
  );

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
      <SafeScreen testID="home:screen:root">
        <EmptyState
          testID="home:empty:no-goal"
          title={t('home.noGoal.title')}
          body={t('home.noGoal.body')}
          ctaLabel={t('home.noGoal.cta')}
          onCtaPress={goOnboarding}
        />
      </SafeScreen>
    );
  }

  if (goal === undefined) {
    return (
      <SafeScreen testID="home:screen:root">
        <EmptyState
          testID="home:empty:loading"
          title={t('common.loading')}
          body={t('home.loading.body')}
        />
      </SafeScreen>
    );
  }

  if (goal === null) {
    return (
      <SafeScreen testID="home:screen:root">
        <EmptyState
          testID="home:empty:missing"
          title={t('home.missingGoal.title')}
          body={t('home.missingGoal.body')}
          ctaLabel={t('home.missingGoal.cta')}
          onCtaPress={goOnboarding}
        />
      </SafeScreen>
    );
  }

  const daysLeft = daysUntilTargetEnd(goal.targetDate);

  return (
    <SafeScreen testID="home:screen:root">
      <ScrollView
        className="flex-1 px-4 pt-3"
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <AppCard className="mb-4 overflow-hidden border-white/10 p-0">
          <View style={{ borderLeftWidth: 4, borderLeftColor: accentTint }} className="px-4 py-4">
            <Caption className="mb-1 text-xs uppercase tracking-wide text-muted">
              {t('home.hero.kicker')}
            </Caption>
            <Display className="mb-2 text-2xl leading-8" numberOfLines={2}>
              {goal.title}
            </Display>
            <Body className="text-secondary">
              {daysLeft <= 0
                ? t('home.targetDay')
                : t('home.daysLeft', { count: Math.max(1, daysLeft) })}
            </Body>
          </View>
        </AppCard>

        <PrimaryButton
          testID="home:capture:cta"
          variant="orange"
          className="mb-2"
          onPress={openCapture}
          accessibilityLabel={t('home.checkInCta')}
        >
          {t('home.checkInCta')}
        </PrimaryButton>
        <Caption className="mb-5 text-center text-muted">{t('home.checkInHint')}</Caption>

        {daysLeft <= 0 ? (
          <Pressable
            testID="home:finale:banner"
            accessibilityRole="button"
            accessibilityLabel={t('collage.banner.cta')}
            onPress={() => {
              rootNav?.navigate('CollageFinale', { goalId: activeGoalId });
            }}
            className="mb-6 rounded-2xl border border-accentOrange/50 bg-accentOrange/15 px-4 py-4"
          >
            <Heading className="mb-1 text-lg text-orange-200">{t('collage.banner.title')}</Heading>
            <Body className="font-semibold text-accentOrange">{t('collage.banner.cta')}</Body>
          </Pressable>
        ) : null}

        <View className="mb-4 flex-row gap-3">
          <StreakCounter activeGoalId={activeGoalId} compact />
          <JourneyProgressCard goal={goal} accentColor={accentTint} />
        </View>

        <View className="mb-4">
          <CompanionCard activeGoalId={activeGoalId} />
        </View>

        <View className="mb-4">
          <EmotionHeatmap activeGoalId={activeGoalId} />
        </View>

        <View className="mb-6">
          <BadgeRow activeGoalId={activeGoalId} />
        </View>

        <SectionHeader title={t('capsule.list.title')} className="px-0" />
        {capsules.length === 0 ? (
          <Body className="mb-4 text-muted">{t('capsule.list.empty')}</Body>
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
          className="items-center rounded-2xl border border-accentOrange/40 bg-accentOrange/10 py-4"
        >
          <Body className="font-semibold text-accentOrange">{t('capsule.list.createCta')}</Body>
        </Pressable>
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
