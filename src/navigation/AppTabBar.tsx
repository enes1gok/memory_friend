import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { LayoutChangeEvent, Platform, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Caption } from '@/components/Typography';
import { useUIStore } from '@/stores/useUIStore';
import { getAccentColor } from '@/theme/accent';
import { colors } from '@/theme/colors';
import { elevation } from '@/theme/elevation';
import { durations, useReduceMotionPreference } from '@/theme/motion';

const iconByRoute = {
  Home: 'home-outline',
  Journal: 'book-outline',
  Capture: 'add',
  Profile: 'person-outline',
} as const;

const SPRING_TAB = { damping: 18, stiffness: 220 } as const;
const SPRING_CAPTURE = { damping: 16, stiffness: 240 } as const;

/** Layout tokens: keep bar height stable; ring must not expand row layout. */
const INDICATOR_SIZE = 36;
const ROW_PADDING_H = 8;
const ROW_PADDING_TOP = 8;
const TAB_ICON_ROW = 26;
const LABEL_HEIGHT = 18;
const CAPTURE_SIZE = 58;
const CAPTURE_RING_SIZE = 72;
/** Negative margin lifts the FAB above the pill; stronger float than legacy -28. */
const CAPTURE_LIFT = -38;
/** Vertical center of icon row: row padding + half icon row minus half pill. */
const INDICATOR_TOP = ROW_PADDING_TOP + TAB_ICON_ROW / 2 - INDICATOR_SIZE / 2;

function colorWithOpacity(hex: string, opacity: number): string {
  const n = hex.replace('#', '');
  const bigint = parseInt(n, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${opacity})`;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 8,
    borderRadius: 24,
    overflow: 'visible',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(15,15,26,0.74)' : colors.surface,
    ...elevation.floating,
  },
  accentStrip: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: StyleSheet.hairlineWidth,
    minHeight: 1,
    zIndex: 2,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    overflow: 'hidden',
  },
  rowWrap: {
    position: 'relative',
    zIndex: 1,
  },
  tabIndicator: {
    position: 'absolute',
    top: INDICATOR_TOP,
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    zIndex: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingHorizontal: ROW_PADDING_H,
    paddingTop: ROW_PADDING_TOP,
    paddingBottom: 6,
    zIndex: 1,
  },
  tabButton: {
    flex: 1,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: TAB_ICON_ROW + LABEL_HEIGHT,
    overflow: 'visible',
  },
  iconRow: {
    height: TAB_ICON_ROW,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
});

function TabIconSlot({ focused, children }: { focused: boolean; children: ReactNode }) {
  const scale = useSharedValue(focused ? 1.18 : 1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.18 : 1, SPRING_TAB);
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

function TabLabel({ focused, children }: { focused: boolean; children: ReactNode }) {
  const opacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(focused ? 1 : 0, { duration: durations.fast });
  }, [focused, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[{ height: LABEL_HEIGHT, justifyContent: 'center' }, animatedStyle]}
    >
      <Caption className="text-center text-[11px] font-semibold text-primary" numberOfLines={1}>
        {children}
      </Caption>
    </Animated.View>
  );
}

function CaptureButton({
  focused,
  color,
  ringColor,
  reduceMotion,
}: {
  focused: boolean;
  color: string;
  ringColor: string;
  reduceMotion: boolean;
}) {
  const scale = useSharedValue(1);
  const pulse = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.08 : 1, SPRING_CAPTURE);
  }, [focused, scale]);

  useEffect(() => {
    if (reduceMotion || !focused) {
      cancelAnimation(pulse);
      pulse.value = withTiming(0, { duration: durations.fast });
      return;
    }
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0, { duration: 1000 }),
      ),
      -1,
      true,
    );
    return () => {
      cancelAnimation(pulse);
    };
  }, [focused, reduceMotion, pulse]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + 0.55 * pulse.value,
    transform: [{ scale: 0.95 + 0.1 * pulse.value }],
  }));

  const ringInset = (CAPTURE_SIZE - CAPTURE_RING_SIZE) / 2;

  return (
    <View
      style={{
        width: CAPTURE_SIZE,
        height: CAPTURE_SIZE,
        marginTop: CAPTURE_LIFT,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            left: ringInset,
            top: ringInset,
            width: CAPTURE_RING_SIZE,
            height: CAPTURE_RING_SIZE,
            borderRadius: CAPTURE_RING_SIZE / 2,
            borderWidth: 2,
            borderColor: colorWithOpacity(ringColor, 0.35),
          },
          ringStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            width: CAPTURE_SIZE,
            height: CAPTURE_SIZE,
            borderRadius: CAPTURE_SIZE / 2,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 3,
            borderColor: colors.canvas,
            backgroundColor: color,
          },
          elevation.floating,
          buttonStyle,
        ]}
      >
        <Ionicons name="add" color={colors.textPrimary} size={30} />
      </Animated.View>
    </View>
  );
}

type SlotLayout = { x: number; width: number };

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const accentProgress = useUIStore((s) => s.accentProgress);
  const activeTint = getAccentColor(accentProgress);
  const reduceMotion = useReduceMotionPreference();

  const [slotLayouts, setSlotLayouts] = useState<Partial<Record<number, SlotLayout>>>({});
  const indicatorX = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);
  const stripProgress = useSharedValue(1);
  const stripFrom = useSharedValue(activeTint);
  const stripTo = useSharedValue(activeTint);

  useEffect(() => {
    stripFrom.value = stripTo.value;
    stripTo.value = activeTint;
    stripProgress.value = 0;
    stripProgress.value = withTiming(1, { duration: durations.base });
  }, [activeTint, stripFrom, stripProgress, stripTo]);

  const activeRoute = state.routes[state.index];
  const captureFocused = activeRoute?.name === 'Capture';

  useLayoutEffect(() => {
    if (captureFocused) {
      indicatorOpacity.value = withTiming(0, { duration: durations.fast });
      return;
    }
    const slot = slotLayouts[state.index];
    if (slot == null || slot.width <= 0) {
      indicatorOpacity.value = withTiming(0, { duration: durations.fast });
      return;
    }
    const x = slot.x + (slot.width - INDICATOR_SIZE) / 2;
    indicatorX.value = withSpring(x, SPRING_TAB);
    indicatorOpacity.value = withTiming(1, { duration: durations.fast });
  }, [state.index, slotLayouts, captureFocused, indicatorOpacity, indicatorX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    left: indicatorX.value,
    opacity: indicatorOpacity.value,
  }));

  const accentStripStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(stripProgress.value, [0, 1], [stripFrom.value, stripTo.value]),
  }));

  const onTabLayout = (index: number) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setSlotLayouts((prev) => ({ ...prev, [index]: { x, width } }));
  };

  const pillValid = !captureFocused && slotLayouts[state.index] != null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}
    >
      <Animated.View style={[styles.accentStrip, accentStripStyle]} pointerEvents="none" />
      {Platform.OS === 'ios' ? <BlurView intensity={30} tint="dark" style={styles.blur} /> : null}
      <View style={styles.rowWrap}>
        {pillValid ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.tabIndicator,
              indicatorStyle,
              { backgroundColor: colorWithOpacity(activeTint, 0.18) },
            ]}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          />
        ) : null}
        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const options = descriptors[route.key].options;
            const label =
              typeof options.tabBarLabel === 'string'
                ? options.tabBarLabel
                : typeof options.title === 'string'
                  ? options.title
                  : route.name;
            const color = focused ? activeTint : colors.textMuted;
            const isCapture = route.name === 'Capture';
            const ringColor = focused ? activeTint : colors.accentOrange;

            return (
              <AnimatedPressable
                key={route.key}
                haptic
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
                testID={`tab:${route.name.toLowerCase()}:press`}
                style={styles.tabButton}
                onLayout={onTabLayout(index)}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!focused && !event.defaultPrevented) {
                    navigation.navigate(route.name, route.params);
                  }
                }}
              >
                <View style={styles.iconRow}>
                  {isCapture ? (
                    <CaptureButton
                      focused={focused}
                      color={focused ? activeTint : colors.accentOrange}
                      ringColor={ringColor}
                      reduceMotion={reduceMotion}
                    />
                  ) : (
                    <TabIconSlot focused={focused}>
                      <Ionicons name={iconByRoute[route.name as keyof typeof iconByRoute]} color={color} size={22} />
                    </TabIconSlot>
                  )}
                </View>
                <TabLabel focused={focused}>{label}</TabLabel>
              </AnimatedPressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
