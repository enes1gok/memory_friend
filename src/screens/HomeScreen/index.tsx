import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { GradientCard } from '@/components/GradientCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SafeScreen } from '@/components/SafeScreen';
import { Skeleton } from '@/components/Skeleton';
import { Body, Display } from '@/components/Typography';
import { HypeManModal } from '@/features/ai';
import { journeyPercent, useActiveGoal } from '@/features/streak';
import type { Goal } from '@/models/Goal';
import { TAB_BAR_FLOATING_OVERLAY_DP } from '@/navigation/tabBarMetrics';
import type { RootStackParamList } from '@/navigation/types';
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
    paddingBottom: 22,
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
  const insets = useSafeAreaInsets();
  const activeGoalId = useGoalStore((s) => s.activeGoalId);
  const goal = useActiveGoal();
  const navigation = useNavigation();
  const rootNav = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
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
    rootNav?.navigate('Capture');
  }, [rootNav]);

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
          <Skeleton variant="block" height={200} style={{ marginBottom: 20 }} />
          <Skeleton variant="line" width="70%" style={{ marginBottom: 16 }} />
          <Skeleton variant="block" height={52} style={{ marginBottom: 12 }} />
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
        contentContainerStyle={[
          homeStyles.scrollContent,
          { paddingBottom: TAB_BAR_FLOATING_OVERLAY_DP + Math.max(insets.bottom, 8) },
        ]}
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
              <Display className="mb-2 text-[26px] leading-[32px]" numberOfLines={3}>
                {goal.title}
              </Display>

              <Body className="mb-4 text-base text-secondary">
                {daysLeft <= 0
                  ? t('home.targetDay')
                  : t('home.daysLeft', { count: Math.max(1, daysLeft) })}
              </Body>

              <Body className="mb-5 text-sm text-muted">{t('home.addMemoryIntro')}</Body>

              <PrimaryButton
                testID="home:add-memory:cta"
                variant="orange"
                gradient
                className="mt-1"
                onPress={openCapture}
                accessibilityLabel={t('home.addMemoryCta')}
              >
                {t('home.addMemoryCta')}
              </PrimaryButton>
              <Body className="mt-2 text-center text-sm text-muted">{t('home.addMemoryHint')}</Body>
            </View>
          </GradientCard>
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
