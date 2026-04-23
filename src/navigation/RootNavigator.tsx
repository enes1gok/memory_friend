import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PlaceholderModalScreen } from '@/screens/PlaceholderModalScreen';
import { useGoalStore } from '@/stores/useGoalStore';
import { colors } from '@/theme/colors';

import { OnboardingNavigator } from './OnboardingNavigator';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const activeGoalId = useGoalStore((s) => s.activeGoalId);

  return (
    <Stack.Navigator
      initialRouteName={activeGoalId ? 'MainTabs' : 'Onboarding'}
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="PlaceholderModal"
        component={PlaceholderModalScreen}
        options={{
          presentation: 'modal',
          title: '',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}
