import './global.css';

import { DatabaseProvider } from '@nozbe/watermelondb/react';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { Poppins_600SemiBold, Poppins_700Bold, useFonts } from '@expo-google-fonts/poppins';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { getDatabase } from '@/database';
import i18n from '@/i18n';
import { RootNavigator } from '@/navigation/RootNavigator';
import { colors } from '@/theme/colors';

function LoadingShell() {
  const { t } = useTranslation();

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: colors.canvas }}
      accessibilityLabel={t('common.loading')}
    >
      <ActivityIndicator size="large" color={colors.accentBlue} />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
    Poppins_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  return (
    <I18nextProvider i18n={i18n}>
      {!fontsLoaded ? (
        <LoadingShell />
      ) : (
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <DatabaseProvider database={getDatabase()}>
              <NavigationContainer>
                <StatusBar style="light" />
                <RootNavigator />
              </NavigationContainer>
            </DatabaseProvider>
          </GestureHandlerRootView>
        </SafeAreaProvider>
      )}
    </I18nextProvider>
  );
}
