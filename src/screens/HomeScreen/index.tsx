import { Ionicons } from '@expo/vector-icons';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

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
  journeyPercent,
  useActiveGoal,
  useStreakState,
} from '@/features/streak';
import type { Goal } from '@/models/Goal';
import type { RootStackParamList, TabParamList } from '@/navigation/types';
import { useGoalStore } from '@/stores/useGoalStore';
import { useUIStore } from '@/stores/useUIStore';
import { getAccentColor } from '@/theme/accent';

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
  const journeyPct = journeyPercent(goal);

  return (
    <SafeScreen testID="home:screen:root">
      <ScrollView
        style={homeStyles.scroll}
        contentContainerStyle={homeStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        <View
          style={[
            homeStyles.heroGlowWrap,
            {
              shadowColor: accentTint,
            },
          ]}
        >
          <AppCard
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
            className="border-white/10 p-0"
          >
            <View style={[homeStyles.heroProgressRail, { backgroundColor: `${accentTint}33` }]}>
              <View style={[homeStyles.heroProgressFill, { width: `${journeyPct}%`, backgroundColor: accentTint }]} />
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
                <View
                  style={homeStyles.chip}
                  accessibilityLabel={
                    streakHydrating
                      ? t('home.chip.a11y.streakLoading')
                      : t('home.chip.a11y.streak', { count: currentStreak })
                  }
                >
                  <View style={homeStyles.chipIconRow}>
                    <Ionicons name="flame-outline" size={18} color={accentTint} />
                  </View>
                  <Caption className="mb-0.5 text-[10px] uppercase tracking-wider text-muted">
                    {t('home.stats.streakLabel')}
                  </Caption>
                  <Display className="text-2xl leading-8" accessibilityRole="none">
                    {streakHydrating ? '…' : currentStreak}
                  </Display>
                  <Caption className="text-[11px] text-muted">{t('streak.dayStreakShort')}</Caption>
                </View>

                <View
                  style={homeStyles.chip}
                  accessibilityLabel={t('home.chip.a11y.progress', { percent: journeyPct })}
                >
                  <View style={homeStyles.chipIconRow}>
                    <Ionicons name="stats-chart-outline" size={18} color={accentTint} />
                  </View>
                  <Caption className="mb-0.5 text-[10px] uppercase tracking-wider text-muted">
                    {t('home.stats.journeyLabel')}
                  </Caption>
                  <Display className="text-2xl leading-8">{journeyPct}%</Display>
                  <Caption className="text-[11px] text-muted" numberOfLines={2}>
                    {t('home.chip.progressFootnote')}
                  </Caption>
                </View>

                <View
                  style={homeStyles.chip}
                  accessibilityLabel={
                    daysLeft <= 0
                      ? t('home.chip.a11y.target')
                      : t('home.chip.a11y.days', { count: Math.max(1, daysLeft) })
                  }
                >
                  <View style={homeStyles.chipIconRow}>
                    <Ionicons name="calendar-outline" size={18} color={accentTint} />
                  </View>
                  <Caption className="mb-0.5 text-[10px] uppercase tracking-wider text-muted">
                    {t('home.chip.daysLabel')}
                  </Caption>
                  <Display
                    className={`text-2xl leading-8 ${daysLeft <= 0 ? 'text-[22px]' : ''}`}
                    numberOfLines={daysLeft <= 0 ? 2 : 1}
                  >
                    {daysLeft <= 0 ? t('home.chip.atTarget') : String(Math.max(1, daysLeft))}
                  </Display>
                  <Caption className="text-[11px] text-muted">
                    {daysLeft <= 0 ? t('home.chip.targetDayHint') : t('home.chip.daysLeftCaption')}
                  </Caption>
                </View>
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
          </AppCard>
        </View>

        {daysLeft <= 0 ? (
          <Pressable
            testID="home:finale:banner"
            accessibilityRole="button"
            accessibilityLabel={t('collage.banner.cta')}
            onPress={() => {
              rootNav?.navigate('CollageFinale', { goalId: activeGoalId });
            }}
            style={homeStyles.finaleBanner}
          >
            <Heading className="mb-1 text-lg text-orange-200">{t('collage.banner.title')}</Heading>
            <Body className="font-semibold text-accentOrange">{t('collage.banner.cta')}</Body>
          </Pressable>
        ) : null}

        <View style={homeStyles.sectionBlock}>
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
        </View>

        <View style={homeStyles.sectionBlock}>
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
          <Pressable
            testID="home:capsule:create-cta"
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
