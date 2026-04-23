import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { PlaceholderModalScreen } from '@/screens/PlaceholderModalScreen';
import { colors } from '@/theme/colors';

import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
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
