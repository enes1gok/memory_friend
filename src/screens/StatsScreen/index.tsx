import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPressable } from '@/components/AnimatedPressable';
import { EmptyState } from '@/components/EmptyState';
import { GradientCard } from '@/components/GradientCard';
import { SafeScreen } from '@/components/SafeScreen';
import { SectionHeader } from '@/components/SectionHeader';
import { Skeleton } from '@/components/Skeleton';
import { Body, Caption, Display, Heading } from '@/components/Typography';
import { CapsuleCard } from '@/features/capsule/components/CapsuleCard';
import { useCapsulesByGoal } from '@/features/capsule/hooks/useCapsulesByGoal';
import { journeyPercent, useActiveGoal, useStreakState } from '@/features/streak';
import type { Goal } from '@/models/Goal';
import { TAB_BAR_FLOATING_OVERLAY_DP } from '@/navigation/tabBarMetrics';
import type { RootStackParamList } from '@/navigation/types';
import { useGoalStore } from '@/stores/useGoalStore';
import { useUIStore } from '@/stores/useUIStore';
import { getAccentColor } from '@/theme/accent';
import { colors } from '@/theme/colors';
import { enterAnimation } from '@/theme/motion';

import { RhythmSection } from './RhythmSection';

const statsStyles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
    height: 5,
    width: '100%',
  },
  heroProgressFill: {
    height: '100%',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  heroInner: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'stretch',
  },
  statItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 32,
    alignSelf: 'center',
    backgroundColor: colors.borderSubtle,
  },
  sectionBlock: {
    marginBottom: 22,
  },
  capsuleCreateCta: {
    alignItems: 'center',
    paddingVertical: 14,
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

  return <Animated.View style={[statsStyles.heroProgressFill, animatedStyle]} />;
}

export function StatsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const activeGoalId = useGoalStore((s) => s.activeGoalId);
  const goal = useActiveGoal();
  const navigation = useNavigation();
  const rootNav = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const capsules = useCapsulesByGoal(activeGoalId);
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

  const goOnboarding = useCallback(() => {
    rootNav?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      }),
    );
  }, [rootNav]);

  if (!activeGoalId) {
    return (
      <SafeScreen testID="stats:screen:root">
        <EmptyState
          testID="stats:empty:no-goal"
          title={t('stats.noGoal.title')}
          body={t('stats.noGoal.body')}
          ctaLabel={t('stats.noGoal.cta')}
          onCtaPress={goOnboarding}
        />
      </SafeScreen>
    );
  }

  if (goal === undefined) {
    return (
      <SafeScreen testID="stats:screen:root">
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
      <SafeScreen testID="stats:screen:root">
        <EmptyState
          testID="stats:empty:missing"
          title={t('stats.missingGoal.title')}
          body={t('stats.missingGoal.body')}
          ctaLabel={t('stats.missingGoal.cta')}
          onCtaPress={goOnboarding}
        />
      </SafeScreen>
    );
  }

  const daysLeft = daysUntilTargetEnd(goal.targetDate);
  const journeyPct = journeyPercent(goal);

  return (
    <SafeScreen testID="stats:screen:root">
      <ScrollView
        style={statsStyles.scroll}
        contentContainerStyle={[
          statsStyles.scrollContent,
          { paddingBottom: TAB_BAR_FLOATING_OVERLAY_DP + Math.max(insets.bottom, 8) },
        ]}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        <Animated.View
          entering={enterAnimation(0)}
          style={[
            statsStyles.heroGlowWrap,
            {
              shadowColor: accentTint,
            },
          ]}
        >
          <GradientCard
            testID="stats:hero:card"
            accessibilityRole="summary"
            accessibilityLabel={t('stats.hero.a11y', {
              goal: goal.title,
              status:
                daysLeft <= 0
                  ? t('stats.targetDay')
                  : t('stats.daysLeft', { count: Math.max(1, daysLeft) }),
            })}
            style={statsStyles.heroCard}
            contentStyle={{ padding: 0 }}
            colors={[`${accentTint}2A`, 'rgba(255,255,255,0.03)', colors.surfaceContainer]}
          >
            <View style={[statsStyles.heroProgressRail, { backgroundColor: `${accentTint}33` }]}>
              <AnimatedProgressFill percent={journeyPct} color={accentTint} />
            </View>

            <View style={statsStyles.heroInner}>
              <Display className="mb-3 text-[26px] leading-[32px]" numberOfLines={3}>
                {goal.title}
              </Display>

              <Body className="mb-5 text-base text-secondary">
                {daysLeft <= 0
                  ? t('stats.targetDay')
                  : t('stats.daysLeft', { count: Math.max(1, daysLeft) })}
              </Body>

              <View style={statsStyles.statsRow}>
                <View
                  style={statsStyles.statItem}
                  accessibilityLabel={
                    streakHydrating
                      ? t('stats.chip.a11y.streakLoading')
                      : t('stats.chip.a11y.streak', { count: currentStreak })
                  }
                >
                  <Display className="text-2xl leading-8">
                    {streakHydrating ? '…' : currentStreak}
                  </Display>
                  <Caption className="mt-0.5 text-center text-[11px] text-muted" numberOfLines={1}>
                    {t('stats.stats.streakLabel')}
                  </Caption>
                </View>
                <View style={statsStyles.statDivider} />
                <View
                  style={statsStyles.statItem}
                  accessibilityLabel={t('stats.chip.a11y.progress', { percent: journeyPct })}
                >
                  <Display className="text-2xl leading-8">{`${journeyPct}%`}</Display>
                  <Caption className="mt-0.5 text-center text-[11px] text-muted" numberOfLines={1}>
                    {t('stats.stats.journeyLabel')}
                  </Caption>
                </View>
                <View style={statsStyles.statDivider} />
                <View
                  style={statsStyles.statItem}
                  accessibilityLabel={
                    daysLeft <= 0
                      ? t('stats.chip.a11y.target')
                      : t('stats.chip.a11y.days', { count: Math.max(1, daysLeft) })
                  }
                >
                  <Display className="text-2xl leading-8" numberOfLines={1}>
                    {daysLeft <= 0 ? t('stats.chip.atTarget') : String(Math.max(1, daysLeft))}
                  </Display>
                  <Caption className="mt-0.5 text-center text-[11px] text-muted" numberOfLines={1}>
                    {t('stats.chip.daysLabel')}
                  </Caption>
                </View>
              </View>
            </View>
          </GradientCard>
        </Animated.View>

        {daysLeft <= 0 ? (
          <AnimatedPressable
            testID="stats:finale:banner"
            haptic
            accessibilityRole="button"
            accessibilityLabel={t('collage.banner.cta')}
            onPress={() => {
              rootNav?.navigate('CollageFinale', { goalId: activeGoalId });
            }}
            className="mb-2xl"
          >
            <GradientCard
              colors={[`${colors.accentOrange}55`, `${colors.accentRed}22`, colors.surfaceContainer]}
              contentStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
            >
              <Heading className="mb-1 text-lg text-orange-200">{t('collage.banner.title')}</Heading>
              <Body className="font-semibold text-accentOrange">{t('collage.banner.cta')}</Body>
            </GradientCard>
          </AnimatedPressable>
        ) : null}

        <Animated.View entering={enterAnimation(1)} style={statsStyles.sectionBlock}>
          <RhythmSection activeGoalId={activeGoalId} />
        </Animated.View>

        <Animated.View entering={enterAnimation(2)} style={statsStyles.sectionBlock}>
          <SectionHeader
            title={t('capsule.list.title')}
            subtitle={t('stats.capsulesSection.subtitle')}
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
            testID="stats:capsule:create-cta"
            haptic
            onPress={() => {
              if (activeGoalId) {
                rootNav?.navigate('CapsuleCreate', { goalId: activeGoalId });
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={t('capsule.list.createCta')}
            style={statsStyles.capsuleCreateCta}
          >
            <Body className="font-semibold text-accentOrange">{t('capsule.list.createCta')}</Body>
          </AnimatedPressable>
        </Animated.View>
      </ScrollView>
    </SafeScreen>
  );
}
