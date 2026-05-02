import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

import { View } from 'react-native';

import { useAiCompanionNudge } from '@/features/ai/hooks/useAiCompanionNudge';
import { useNotificationResponseHandler } from '@/features/notification/hooks/useNotificationResponseHandler';
import { useScheduleReminders } from '@/features/notification/hooks/useScheduleReminders';
import { HomeScreen } from '@/screens/HomeScreen';
import { JournalScreen } from '@/screens/JournalScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { StatsScreen } from '@/screens/StatsScreen';

import { AppTabBar } from './AppTabBar';
import { JournalEntryFlyOverlay } from './JournalEntryFlyOverlay';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  useScheduleReminders();
  useNotificationResponseHandler();
  useAiCompanionNudge();
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={(props) => <AppTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            tabBarLabel: t('tabs.home'),
            tabBarAccessibilityLabel: t('tabs.home'),
          }}
        />
        <Tab.Screen
          name="Stats"
          component={StatsScreen}
          options={{
            tabBarLabel: t('tabs.stats'),
            tabBarAccessibilityLabel: t('tabs.stats'),
          }}
        />
        <Tab.Screen
          name="Journal"
          component={JournalScreen}
          options={{
            tabBarLabel: t('tabs.journal'),
            tabBarAccessibilityLabel: t('tabs.journal'),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: t('tabs.profile'),
            tabBarAccessibilityLabel: t('tabs.profile'),
          }}
        />
      </Tab.Navigator>
      <JournalEntryFlyOverlay />
    </View>
  );
}
