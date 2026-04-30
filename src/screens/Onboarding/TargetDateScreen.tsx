import DateTimePicker from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Body, Caption, Heading } from '@/components/Typography';
import { SafeScreen } from '@/components/SafeScreen';
import type { OnboardingStackParamList } from '@/navigation/types';
import { hapticLight } from '@/utils/haptics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingTargetDate'>;

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function TargetDateScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const { goalTitle } = route.params;
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    d.setHours(12, 0, 0, 0);
    return d;
  });
  const [showPicker, setShowPicker] = useState(false);

  function onNext() {
    hapticLight();
    navigation.navigate('OnboardingStart', {
      goalTitle,
      targetDateIso: targetDate.toISOString(),
    });
  }

  return (
    <SafeScreen testID="onboarding:target-date:root">
      <View className="flex-1 justify-center px-6">
        <Caption className="mb-6 text-center text-muted">
          {t('onboarding.step.label', { current: 2, total: 3 })}
        </Caption>
        <Heading className="mb-2">{t('onboarding.targetDate.title')}</Heading>
        <Body className="mb-6 text-muted">{t('onboarding.targetDate.subtitle')}</Body>

        {Platform.OS === 'android' ? (
          <>
            <Pressable
              testID="onboarding:target-date:open-picker"
              onPress={() => setShowPicker(true)}
              accessibilityRole="button"
              accessibilityLabel={t('onboarding.targetDate.openPicker')}
              className="mb-6 rounded-xl border border-white/15 bg-surfaceElevated/90 py-4"
            >
              <Body className="text-center text-primary">
                {targetDate.toLocaleDateString()}
              </Body>
            </Pressable>
            {showPicker ? (
              <DateTimePicker
                testID="onboarding:target-date:picker"
                value={targetDate}
                mode="date"
                display="default"
                minimumDate={startOfToday()}
                onChange={(event, date) => {
                  setShowPicker(false);
                  if (event.type === 'set' && date) {
                    setTargetDate(date);
                  }
                }}
              />
            ) : null}
          </>
        ) : (
          <View className="mb-8">
            <DateTimePicker
              testID="onboarding:target-date:picker"
              value={targetDate}
              mode="date"
              display="spinner"
              themeVariant="dark"
              minimumDate={startOfToday()}
              onChange={(_, date) => {
                if (date) setTargetDate(date);
              }}
            />
          </View>
        )}

        <PrimaryButton
          testID="onboarding:target-date:next"
          onPress={onNext}
          accessibilityLabel={t('onboarding.targetDate.next')}
        >
          {t('onboarding.targetDate.next')}
        </PrimaryButton>
      </View>
    </SafeScreen>
  );
}
