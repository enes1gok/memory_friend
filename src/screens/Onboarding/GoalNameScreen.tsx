import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { Body, Heading } from '@/components/Typography';
import { SafeScreen } from '@/components/SafeScreen';
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
        <Heading className="mb-2">{t('onboarding.goalName.title')}</Heading>
        <Body className="mb-6 text-slate-400">{t('onboarding.goalName.subtitle')}</Body>
        <TextInput
          testID="onboarding:goal-name:input"
          value={title}
          onChangeText={setTitle}
          placeholder={t('onboarding.goalName.placeholder')}
          placeholderTextColor={colors.textMuted}
          className="mb-8 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-base text-white"
          accessibilityLabel={t('onboarding.goalName.placeholder')}
          autoFocus
          returnKeyType="next"
          onSubmitEditing={onNext}
        />
        <Pressable
          testID="onboarding:goal-name:next"
          onPress={onNext}
          disabled={!canContinue}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.goalName.next')}
          className={`items-center rounded-xl py-4 ${canContinue ? 'bg-blue-600' : 'bg-slate-800'}`}
        >
          <Body className="font-semibold text-white">{t('onboarding.goalName.next')}</Body>
        </Pressable>
      </View>
    </SafeScreen>
  );
}
