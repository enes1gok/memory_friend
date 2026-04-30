import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

import { useAiCompanionNudge } from '@/features/ai/hooks/useAiCompanionNudge';
import { useNotificationResponseHandler } from '@/features/notification/hooks/useNotificationResponseHandler';
import { useScheduleReminders } from '@/features/notification/hooks/useScheduleReminders';
import { CaptureScreen } from '@/screens/CaptureScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { JournalScreen } from '@/screens/JournalScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';

import { AppTabBar } from './AppTabBar';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  useScheduleReminders();
  useNotificationResponseHandler();
  useAiCompanionNudge();
  const { t } = useTranslation();

  return (
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
        name="Journal"
        component={JournalScreen}
        options={{
          tabBarLabel: t('tabs.journal'),
          tabBarAccessibilityLabel: t('tabs.journal'),
        }}
      />
      <Tab.Screen
        name="Capture"
        component={CaptureScreen}
        options={{
          tabBarLabel: t('tabs.capture'),
          tabBarAccessibilityLabel: t('tabs.capture'),
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
  );
}
