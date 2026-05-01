import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/EmptyState';
import { SafeScreen } from '@/components/SafeScreen';
import { Skeleton } from '@/components/Skeleton';
import { HypeManModal } from '@/features/ai';
import { QuickAddCard } from '@/features/journal';
import { useActiveGoal } from '@/features/streak';
import type { Goal } from '@/models/Goal';
import { TAB_BAR_FLOATING_OVERLAY_DP } from '@/navigation/tabBarMetrics';
import type { RootStackParamList } from '@/navigation/types';
import { useGoalStore } from '@/stores/useGoalStore';
import { useUIStore } from '@/stores/useUIStore';
import { getAccentColor } from '@/theme/accent';
import { enterAnimation } from '@/theme/motion';

const homeStyles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});

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

  return (
    <SafeScreen testID="home:screen:root">
      <ScrollView
        style={homeStyles.scroll}
        contentContainerStyle={[
          homeStyles.scrollContent,
          { paddingBottom: TAB_BAR_FLOATING_OVERLAY_DP + Math.max(insets.bottom, 8) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        <Animated.View entering={enterAnimation(0)} className="pt-1">
          <QuickAddCard accentColor={accentTint} />
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
