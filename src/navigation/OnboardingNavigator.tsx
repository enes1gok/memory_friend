import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { GoalNameScreen } from '@/screens/Onboarding/GoalNameScreen';
import { StartScreen } from '@/screens/Onboarding/StartScreen';
import { TargetDateScreen } from '@/screens/Onboarding/TargetDateScreen';
import { colors } from '@/theme/colors';

import type { OnboardingStackParamList } from './types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="OnboardingGoalName"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.canvas },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="OnboardingGoalName" component={GoalNameScreen} />
      <Stack.Screen name="OnboardingTargetDate" component={TargetDateScreen} />
      <Stack.Screen name="OnboardingStart" component={StartScreen} />
    </Stack.Navigator>
  );
}
