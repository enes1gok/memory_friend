import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { SafeScreen } from '@/components/SafeScreen';
import { Body, Caption, Heading } from '@/components/Typography';
import type { OnboardingStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';
import { hapticLight } from '@/utils/haptics';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingGoalName'>;

export function GoalNameScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');

  const canContinue = title.trim().length > 0;

  function onNext() {
    if (!canContinue) return;
    hapticLight();
    navigation.navigate('OnboardingTargetDate', { goalTitle: title.trim() });
  }

  return (
    <SafeScreen testID="onboarding:goal-name:root">
      <View className="flex-1 justify-center px-6">
        <Caption className="mb-6 text-center text-muted">
          {t('onboarding.step.label', { current: 1, total: 3 })}
        </Caption>
        <Heading className="mb-2">{t('onboarding.goalName.title')}</Heading>
        <Body className="mb-6 text-muted">{t('onboarding.goalName.subtitle')}</Body>
        <TextInput
          testID="onboarding:goal-name:input"
          value={title}
          onChangeText={setTitle}
          placeholder={t('onboarding.goalName.placeholder')}
          placeholderTextColor={colors.textMuted}
          className="mb-8 rounded-xl border border-white/15 bg-surfaceElevated/90 px-4 py-3 text-base text-primary"
          accessibilityLabel={t('onboarding.goalName.placeholder')}
          autoFocus
          returnKeyType="next"
          onSubmitEditing={onNext}
        />
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
