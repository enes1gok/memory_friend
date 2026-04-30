import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { AnimatedPressable } from '@/components/AnimatedPressable';
import { EmptyState } from '@/components/EmptyState';
import { GradientCard } from '@/components/GradientCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SafeScreen } from '@/components/SafeScreen';
import { SectionHeader } from '@/components/SectionHeader';
import { Skeleton } from '@/components/Skeleton';
import { StatCard } from '@/components/StatCard';
import { Body, Caption, Display, Heading } from '@/components/Typography';
import { CompanionCard, HypeManModal } from '@/features/ai';
import { CapsuleCard } from '@/features/capsule/components/CapsuleCard';
import { useCapsulesByGoal } from '@/features/capsule/hooks/useCapsulesByGoal';
import {
  BadgeRow,
  EmotionHeatmap,
  journeyPercent,
  useActiveGoal,
  useStreakState,
} from '@/features/streak';
import type { Goal } from '@/models/Goal';
import type { RootStackParamList, TabParamList } from '@/navigation/types';
import { useGoalStore } from '@/stores/useGoalStore';
import { useUIStore } from '@/stores/useUIStore';
import { getAccentColor } from '@/theme/accent';
import { colors } from '@/theme/colors';
import { enterAnimation } from '@/theme/motion';

const homeStyles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36,
  },
  heroGlowWrap: {
    marginBottom: 20,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  heroCard: {
    padding: 0,
    overflow: 'hidden',
  },
  heroProgressRail: {
    height: 4,
    width: '100%',
  },
  heroProgressFill: {
    height: '100%',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  heroInner: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  chip: {
    flex: 1,
    minWidth: 0,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  chipIconRow: {
    marginBottom: 6,
  },
  finaleBanner: {
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.45)',
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
  },
  sectionBlock: {
    marginBottom: 28,
  },
  insightsStack: {
    gap: 14,
  },
  capsuleCreateCta: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.4)',
    backgroundColor: 'rgba(249, 115, 22, 0.08)',
  },
});

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

function AnimatedProgressFill({ percent, color }: { percent: number; color: string }) {
  const progress = useSharedValue(percent);

  useEffect(() => {
    progress.value = withTiming(percent, { duration: 420 });
  }, [percent, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
    backgroundColor: color,
  }));

  return <Animated.View style={[homeStyles.heroProgressFill, animatedStyle]} />;
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
  const { currentStreak, isHydrating: streakHydrating } = useStreakState(activeGoalId);

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
        <View className="flex-1 px-lg pt-xl">
          <Skeleton variant="block" height={220} style={{ marginBottom: 20 }} />
          <Skeleton variant="line" width="58%" style={{ marginBottom: 12 }} />
          <Skeleton variant="block" height={96} style={{ marginBottom: 16 }} />
          <Skeleton variant="block" height={132} />
        </View>
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
  const journeyPct = journeyPercent(goal);

  return (
    <SafeScreen testID="home:screen:root">
      <ScrollView
        style={homeStyles.scroll}
        contentContainerStyle={homeStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        <Animated.View
          entering={enterAnimation(0)}
          style={[
            homeStyles.heroGlowWrap,
            {
              shadowColor: accentTint,
            },
          ]}
        >
          <GradientCard
            testID="home:hero:card"
            accessibilityRole="summary"
            accessibilityLabel={t('home.hero.a11y', {
              goal: goal.title,
              status:
                daysLeft <= 0
                  ? t('home.targetDay')
                  : t('home.daysLeft', { count: Math.max(1, daysLeft) }),
            })}
            style={homeStyles.heroCard}
            contentStyle={{ padding: 0 }}
            colors={[`${accentTint}2A`, 'rgba(255,255,255,0.03)', colors.surface]}
          >
            <View style={[homeStyles.heroProgressRail, { backgroundColor: `${accentTint}33` }]}>
              <AnimatedProgressFill percent={journeyPct} color={accentTint} />
            </View>

            <View style={homeStyles.heroInner}>
              <Caption className="mb-1 text-xs uppercase tracking-wide text-muted">
                {t('home.hero.kicker')}
              </Caption>
              <Display className="mb-3 text-[26px] leading-[32px]" numberOfLines={3}>
                {goal.title}
              </Display>

              <Body className="mb-5 text-base text-secondary">
                {daysLeft <= 0
                  ? t('home.targetDay')
                  : t('home.daysLeft', { count: Math.max(1, daysLeft) })}
              </Body>

              <View style={homeStyles.chipRow}>
                <StatCard
                  icon="flame-outline"
                  accent={accentTint}
                  label={t('home.stats.streakLabel')}
                  value={streakHydrating ? '…' : currentStreak}
                  footnote={t('streak.dayStreakShort')}
                  accessibilityLabel={
                    streakHydrating
                      ? t('home.chip.a11y.streakLoading')
                      : t('home.chip.a11y.streak', { count: currentStreak })
                  }
                />

                <StatCard
                  icon="stats-chart-outline"
                  accent={accentTint}
                  label={t('home.stats.journeyLabel')}
                  value={`${journeyPct}%`}
                  footnote={t('home.chip.progressFootnote')}
                  accessibilityLabel={t('home.chip.a11y.progress', { percent: journeyPct })}
                />

                <StatCard
                  icon="calendar-outline"
                  accent={accentTint}
                  label={t('home.chip.daysLabel')}
                  value={daysLeft <= 0 ? t('home.chip.atTarget') : String(Math.max(1, daysLeft))}
                  footnote={
                    daysLeft <= 0 ? t('home.chip.targetDayHint') : t('home.chip.daysLeftCaption')
                  }
                  accessibilityLabel={
                    daysLeft <= 0
                      ? t('home.chip.a11y.target')
                      : t('home.chip.a11y.days', { count: Math.max(1, daysLeft) })
                  }
                />
              </View>

              <PrimaryButton
                testID="home:capture:cta"
                variant="orange"
                className="mt-2"
                onPress={openCapture}
                accessibilityLabel={t('home.checkInCta')}
              >
                {t('home.checkInCta')}
              </PrimaryButton>
              <Caption className="mt-3 text-center text-muted">{t('home.checkInHint')}</Caption>
            </View>
          </GradientCard>
        </Animated.View>

        {daysLeft <= 0 ? (
          <AnimatedPressable
            testID="home:finale:banner"
            haptic
            accessibilityRole="button"
            accessibilityLabel={t('collage.banner.cta')}
            onPress={() => {
              rootNav?.navigate('CollageFinale', { goalId: activeGoalId });
            }}
            className="mb-2xl"
          >
            <GradientCard
              colors={[`${colors.accentOrange}55`, `${colors.accentRed}22`, colors.surface]}
              contentStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
            >
              <Heading className="mb-1 text-lg text-orange-200">{t('collage.banner.title')}</Heading>
              <Body className="font-semibold text-accentOrange">{t('collage.banner.cta')}</Body>
            </GradientCard>
          </AnimatedPressable>
        ) : null}

        <Animated.View entering={enterAnimation(1)} style={homeStyles.sectionBlock}>
          <SectionHeader
            title={t('home.insights.title')}
            subtitle={t('home.insights.subtitle')}
            className="mb-1 px-0"
          />
          <View style={homeStyles.insightsStack}>
            <CompanionCard activeGoalId={activeGoalId} />
            <EmotionHeatmap activeGoalId={activeGoalId} />
            <BadgeRow activeGoalId={activeGoalId} />
          </View>
        </Animated.View>

        <Animated.View entering={enterAnimation(2)} style={homeStyles.sectionBlock}>
          <SectionHeader
            title={t('capsule.list.title')}
            subtitle={t('home.capsulesSection.subtitle')}
            className="mb-1 px-0"
          />
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
          <AnimatedPressable
            testID="home:capsule:create-cta"
            haptic
            onPress={() => {
              if (activeGoalId) {
                rootNav?.navigate('CapsuleCreate', { goalId: activeGoalId });
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={t('capsule.list.createCta')}
            style={homeStyles.capsuleCreateCta}
          >
            <Body className="font-semibold text-accentOrange">{t('capsule.list.createCta')}</Body>
          </AnimatedPressable>
        </Animated.View>
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
