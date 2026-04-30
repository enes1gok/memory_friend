import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { AppTextInput } from '@/components/AppTextInput';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SafeScreen } from '@/components/SafeScreen';
import { StepDots } from '@/components/StepDots';
import { Body, Caption, Heading } from '@/components/Typography';
import type { OnboardingStackParamList } from '@/navigation/types';
import { hapticLight } from '@/utils/haptics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingGoalName'>;

export function GoalNameScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');

  const canContinue = title.trim().length >= 2;

  function onNext() {
    if (!canContinue) return;
    hapticLight();
    navigation.navigate('OnboardingTargetDate', { goalTitle: title.trim() });
  }

  return (
    <SafeScreen testID="onboarding:goal-name:root">
      <View className="flex-1 justify-center px-6">
        <View className="mb-6">
          <StepDots
            current={1}
            total={3}
            accessibilityLabel={t('onboarding.step.label', { current: 1, total: 3 })}
          />
        </View>
        <Heading className="mb-2">{t('onboarding.goalName.title')}</Heading>
        <Body className="mb-6 text-muted">{t('onboarding.goalName.subtitle')}</Body>
        <AppTextInput
          testID="onboarding:goal-name:input"
          value={title}
          onChangeText={setTitle}
          placeholder={t('onboarding.goalName.placeholder')}
          accessibilityLabel={t('onboarding.goalName.placeholder')}
          autoFocus
          maxLength={80}
          returnKeyType="next"
          onSubmitEditing={onNext}
        />
        <Caption className="mb-8 mt-2 text-right text-muted">{title.length}/80</Caption>
        <PrimaryButton
          testID="onboarding:goal-name:next"
          onPress={onNext}
          disabled={!canContinue}
          accessibilityLabel={t('onboarding.goalName.next')}
        >
          {t('onboarding.goalName.next')}
        </PrimaryButton>
      </View>
    </SafeScreen>
  );
}
