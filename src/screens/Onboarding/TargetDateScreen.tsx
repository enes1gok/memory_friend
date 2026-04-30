import DateTimePicker from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Body, Heading } from '@/components/Typography';
import { SafeScreen } from '@/components/SafeScreen';
import { StepDots } from '@/components/StepDots';
import type { OnboardingStackParamList } from '@/navigation/types';
import { hapticLight } from '@/utils/haptics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingTargetDate'>;

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function datePlusDays(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0);
  return d;
}

function daysFromToday(date: Date): number {
  const start = startOfToday().getTime();
  const picked = new Date(date);
  picked.setHours(0, 0, 0, 0);
  return Math.round((picked.getTime() - start) / (24 * 60 * 60 * 1000));
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
        <View className="mb-6">
          <StepDots
            current={2}
            total={3}
            accessibilityLabel={t('onboarding.step.label', { current: 2, total: 3 })}
          />
        </View>
        <Heading className="mb-2">{t('onboarding.targetDate.title')}</Heading>
        <Body className="mb-6 text-muted">{t('onboarding.targetDate.subtitle')}</Body>

        <View className="mb-4">
          <SegmentedControl
            testID="onboarding:target-date:presets"
            value={
              daysFromToday(targetDate) === 30
                ? '30'
                : daysFromToday(targetDate) === 90
                  ? '90'
                  : 'custom'
            }
            options={[
              { value: '30', label: t('onboarding.targetDate.presets.thirty') },
              { value: '90', label: t('onboarding.targetDate.presets.ninety') },
              { value: 'custom', label: t('onboarding.targetDate.presets.custom') },
            ]}
            onChange={(next) => {
              if (next === '30') {
                setTargetDate(datePlusDays(30));
              } else if (next === '90') {
                setTargetDate(datePlusDays(90));
              } else {
                setShowPicker(true);
              }
            }}
          />
        </View>

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
