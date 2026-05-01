import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PlaceholderModalScreen } from '@/screens/PlaceholderModalScreen';
import { CapsuleCreateScreen } from '@/screens/CapsuleCreateScreen';
import { CapsuleRevealScreen } from '@/screens/CapsuleRevealScreen';
import { CollagePremiereScreen } from '@/screens/CollagePremiereScreen';
import { CaptureScreen } from '@/screens/CaptureScreen';
import { LanguageSettingsScreen } from '@/screens/LanguageSettingsScreen';
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
        headerStyle: { backgroundColor: colors.surfaceContainer },
        headerTintColor: colors.onSurface,
        contentStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="Capture"
        component={CaptureScreen}
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="PlaceholderModal"
        component={PlaceholderModalScreen}
        options={{
          presentation: 'modal',
          title: '',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="LanguageSettings"
        component={LanguageSettingsScreen}
        options={{
          presentation: 'modal',
          title: '',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="CapsuleCreate"
        component={CapsuleCreateScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CapsuleReveal"
        component={CapsuleRevealScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CollageFinale"
        component={CollagePremiereScreen}
        options={{
          presentation: 'fullScreenModal',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
