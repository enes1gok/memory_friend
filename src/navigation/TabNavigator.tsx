import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { useAiCompanionNudge } from '@/features/ai/hooks/useAiCompanionNudge';
import { useNotificationResponseHandler } from '@/features/notification/hooks/useNotificationResponseHandler';
import { useScheduleReminders } from '@/features/notification/hooks/useScheduleReminders';
import { CaptureScreen } from '@/screens/CaptureScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { JournalScreen } from '@/screens/JournalScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { useUIStore } from '@/stores/useUIStore';
import { getAccentColor } from '@/theme/accent';
import { colors } from '@/theme/colors';

import type { TabParamList } from './types';

const styles = StyleSheet.create({
  captureFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },
});

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  useScheduleReminders();
  useNotificationResponseHandler();
  useAiCompanionNudge();
  const { t } = useTranslation();
  const accentProgress = useUIStore(useShallow((s) => s.accentProgress));
  const activeTint = getAccentColor(accentProgress);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: 'rgba(255,255,255,0.08)',
          paddingTop: 8,
          height: 64,
        },
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
          tabBarAccessibilityLabel: t('tabs.home'),
        }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalScreen}
        options={{
          tabBarLabel: t('tabs.journal'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" color={color} size={size} />
          ),
          tabBarAccessibilityLabel: t('tabs.journal'),
        }}
      />
      <Tab.Screen
        name="Capture"
        component={CaptureScreen}
        options={{
          tabBarLabel: t('tabs.capture'),
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.captureFab,
                {
                  marginTop: -28,
                  backgroundColor: focused ? activeTint : colors.accentOrange,
                  borderColor: colors.canvas,
                },
              ]}
            >
              <Ionicons name="add" color={colors.textPrimary} size={30} />
            </View>
          ),
          tabBarAccessibilityLabel: t('tabs.capture'),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
          tabBarAccessibilityLabel: t('tabs.profile'),
        }}
      />
    </Tab.Navigator>
  );
}
