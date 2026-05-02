import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Caption } from '@/components/Typography';
import { useUIStore } from '@/stores/useUIStore';
import { getAccentColor } from '@/theme/accent';
import { colors } from '@/theme/colors';
import { elevation } from '@/theme/elevation';
import { durations, springs } from '@/theme/motion';
import { radius } from '@/theme/radius';

const iconsByRoute = {
  Home: { outline: 'home-outline' as const, filled: 'home' as const },
  Stats: { outline: 'stats-chart-outline' as const, filled: 'stats-chart' as const },
  Journal: { outline: 'book-outline' as const, filled: 'book' as const },
  Profile: { outline: 'person-outline' as const, filled: 'person' as const },
} as const;

const SPRING_TAB = springs.tab;

const ROW_PADDING_H = 8;
const ROW_PADDING_TOP = 8;
const TAB_ICON_ROW = 26;
const DOT_ROW_HEIGHT = 8;
const LABEL_HEIGHT = 18;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 8,
    borderRadius: radius['3xl'],
    overflow: 'visible',
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.surfaceContainerHighest,
    ...elevation.floating,
  },
  rowWrap: {
    position: 'relative',
    zIndex: 1,
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
    minHeight: TAB_ICON_ROW + DOT_ROW_HEIGHT + LABEL_HEIGHT,
    overflow: 'visible',
  },
  iconRow: {
    height: TAB_ICON_ROW,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  dotRow: {
    height: DOT_ROW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});

function TabIconSlot({ focused, children }: { focused: boolean; children: ReactNode }) {
  const scale = useSharedValue(focused ? 1.08 : 1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.08 : 1, SPRING_TAB);
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}

function TabSelectionDot({ focused, tint }: { focused: boolean; tint: string }) {
  const opacity = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    opacity.value = withTiming(focused ? 1 : 0, { duration: durations.fast });
  }, [focused, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.selectionDot, { backgroundColor: tint }, animatedStyle]} accessibilityElementsHidden />
  );
}

function TabLabel({ focused, activeTint, children }: { focused: boolean; activeTint: string; children: ReactNode }) {
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
      <Caption
        className="text-center text-[11px] font-semibold"
        style={{ color: focused ? activeTint : colors.textMuted }}
        numberOfLines={1}
      >
        {children}
      </Caption>
    </Animated.View>
  );
}

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const accentProgress = useUIStore((s) => s.accentProgress);
  const setJournalTabAnchor = useUIStore((s) => s.setJournalTabAnchor);
  const journalIconRef = useRef<View>(null);
  const activeTint = getAccentColor(accentProgress);

  const updateJournalAnchor = useCallback(() => {
    journalIconRef.current?.measureInWindow((x, y, width, height) => {
      setJournalTabAnchor({ x: x + width / 2, y: y + height / 2 });
    });
  }, [setJournalTabAnchor]);

  useEffect(() => {
    requestAnimationFrame(() => {
      updateJournalAnchor();
    });
  }, [insets.bottom, updateJournalAnchor]);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}
    >
      <View style={styles.rowWrap}>
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
            const pair = iconsByRoute[route.name as keyof typeof iconsByRoute];
            const iconName = focused ? pair.filled : pair.outline;
            const isJournal = route.name === 'Journal';

            return (
              <AnimatedPressable
                key={route.key}
                haptic
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
                testID={`tab:${route.name.toLowerCase()}:press`}
                style={styles.tabButton}
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
                <View
                  ref={isJournal ? journalIconRef : undefined}
                  style={styles.iconRow}
                  collapsable={false}
                  onLayout={
                    isJournal
                      ? () => {
                          requestAnimationFrame(() => {
                            updateJournalAnchor();
                          });
                        }
                      : undefined
                  }
                >
                  <TabIconSlot focused={focused}>
                    <Ionicons name={iconName} color={color} size={24} />
                  </TabIconSlot>
                </View>
                <View style={styles.dotRow}>
                  <TabSelectionDot focused={focused} tint={activeTint} />
                </View>
                <TabLabel focused={focused} activeTint={activeTint}>
                  {label}
                </TabLabel>
              </AnimatedPressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
