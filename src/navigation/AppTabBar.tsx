import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPressable } from '@/components/AnimatedPressable';
import { Caption } from '@/components/Typography';
import { getAccentColor } from '@/theme/accent';
import { colors } from '@/theme/colors';
import { elevation } from '@/theme/elevation';
import { useUIStore } from '@/stores/useUIStore';

const iconByRoute = {
  Home: 'home-outline',
  Journal: 'book-outline',
  Capture: 'add',
  Profile: 'person-outline',
} as const;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 8,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(15,15,26,0.74)' : colors.surface,
    ...elevation.floating,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
});

function CaptureButton({ focused, color }: { focused: boolean; color: string }) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(focused ? 1.08 : 1, { damping: 16, stiffness: 240 }) }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: 58,
          height: 58,
          marginTop: -28,
          borderRadius: 29,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 3,
          borderColor: colors.canvas,
          backgroundColor: color,
        },
        elevation.floating,
        animatedStyle,
      ]}
    >
      <Ionicons name="add" color={colors.textPrimary} size={30} />
    </Animated.View>
  );
}

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const accentProgress = useUIStore((s) => s.accentProgress);
  const activeTint = getAccentColor(accentProgress);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}
    >
      {Platform.OS === 'ios' ? <BlurView intensity={30} tint="dark" style={styles.blur} /> : null}
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

          return (
            <AnimatedPressable
              key={route.key}
              haptic
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              testID={`tab:${route.name.toLowerCase()}:press`}
              className="flex-1 items-center justify-center"
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
              {isCapture ? (
                <CaptureButton focused={focused} color={focused ? activeTint : colors.accentOrange} />
              ) : (
                <Ionicons name={iconByRoute[route.name as keyof typeof iconByRoute]} color={color} size={22} />
              )}
              <Caption
                className={`mt-1 text-[11px] font-semibold ${focused ? 'text-primary' : 'text-muted'}`}
              >
                {label}
              </Caption>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}
