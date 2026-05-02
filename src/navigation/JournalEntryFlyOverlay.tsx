import { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUIStore } from '@/stores/useUIStore';
import { motionEasing, useReduceMotionPreference } from '@/theme/motion';

const PARTICLE_SIZE = 14;
const DURATION_MS = 520;
/** Matches `TAB_ICON_ROW` in AppTabBar for fallback anchor Y. */
const TAB_ICON_ROW_HEIGHT = 26;

function estimateJournalAnchor(
  windowWidth: number,
  windowHeight: number,
  bottomInset: number,
): { x: number; y: number } {
  const CONTAINER_H_MARGIN = 12;
  const ROW_H_PAD = 8;
  const inner = windowWidth - 2 * CONTAINER_H_MARGIN - 2 * ROW_H_PAD;
  const tabW = inner / 4;
  const x = CONTAINER_H_MARGIN + ROW_H_PAD + tabW * 2 + tabW / 2;
  const bottomBarOffset = 8;
  const padBottom = Math.max(bottomInset, 8);
  const iconCenterFromBottom = bottomBarOffset + padBottom + 6 + TAB_ICON_ROW_HEIGHT / 2;
  const y = windowHeight - iconCenterFromBottom;
  return { x, y };
}

/**
 * Full-screen overlay: animates a dot from the quick-add save control toward the Journal tab.
 */
export function JournalEntryFlyOverlay() {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReduceMotionPreference();
  const journalFlyRequest = useUIStore((s) => s.journalFlyRequest);
  const journalTabAnchor = useUIStore((s) => s.journalTabAnchor);
  const clearJournalFlyRequest = useUIStore((s) => s.clearJournalFlyRequest);

  const journalTabAnchorRef = useRef(journalTabAnchor);
  journalTabAnchorRef.current = journalTabAnchor;

  const [particleTint, setParticleTint] = useState('#3b82f6');

  const fromX = useSharedValue(0);
  const fromY = useSharedValue(0);
  const toX = useSharedValue(0);
  const toY = useSharedValue(0);
  const progress = useSharedValue(0);
  const rmPulse = useSharedValue(0);

  useEffect(() => {
    if (journalFlyRequest == null) {
      return;
    }

    const { width: W, height: H } = Dimensions.get('window');
    const target = journalTabAnchorRef.current ?? estimateJournalAnchor(W, H, insets.bottom);

    setParticleTint(journalFlyRequest.tint);
    fromX.value = journalFlyRequest.fromX;
    fromY.value = journalFlyRequest.fromY;
    toX.value = target.x;
    toY.value = target.y;

    if (reduceMotion) {
      progress.value = 0;
      rmPulse.value = 1;
      rmPulse.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.quad) }, (finished) => {
        if (finished) {
          runOnJS(clearJournalFlyRequest)();
        }
      });
      return;
    }

    progress.value = 0;
    progress.value = withTiming(
      1,
      { duration: DURATION_MS, easing: motionEasing.emphasizedDecelerate },
      (finished) => {
        if (finished) {
          runOnJS(clearJournalFlyRequest)();
        }
      },
    );
  }, [
    journalFlyRequest,
    insets.bottom,
    reduceMotion,
    clearJournalFlyRequest,
    fromX,
    fromY,
    toX,
    toY,
    progress,
    rmPulse,
  ]);

  const flightStyle = useAnimatedStyle(() => {
    const t = progress.value;
    const nx = fromX.value + (toX.value - fromX.value) * t;
    const ny =
      fromY.value +
      (toY.value - fromY.value) * t +
      Math.sin(Math.PI * t) * -44;
    const opacity = interpolate(t, [0, 0.8, 1], [1, 1, 0]);
    const scale = interpolate(t, [0, 0.88, 1], [1, 1, 0.45]);
    return {
      position: 'absolute',
      left: nx - PARTICLE_SIZE / 2,
      top: ny - PARTICLE_SIZE / 2,
      width: PARTICLE_SIZE,
      height: PARTICLE_SIZE,
      borderRadius: PARTICLE_SIZE / 2,
      opacity,
      transform: [{ scale }],
    };
  });

  const rmStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      left: fromX.value - PARTICLE_SIZE / 2,
      top: fromY.value - PARTICLE_SIZE / 2,
      width: PARTICLE_SIZE,
      height: PARTICLE_SIZE,
      borderRadius: PARTICLE_SIZE / 2,
      opacity: rmPulse.value,
    };
  });

  if (journalFlyRequest == null) {
    return null;
  }

  return (
    <View style={styles.root} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {reduceMotion ? (
        <Animated.View style={[rmStyle, { backgroundColor: particleTint }]} />
      ) : (
        <Animated.View style={[flightStyle, { backgroundColor: particleTint }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
});
