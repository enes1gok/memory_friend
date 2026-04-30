import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import Animated, { Layout } from 'react-native-reanimated';

import { AnimatedPressable } from '@/components/AnimatedPressable';
import { AppSheet } from '@/components/AppSheet';
import { Body, Caption, Heading } from '@/components/Typography';
import { hapticSelection, hapticSuccess } from '@/utils/haptics';

import { MOOD_OPTIONS } from '../constants/moods';

export type MoodPickerProps = {
  visible: boolean;
  onPick: (moodTag: string) => void;
  onDismiss?: () => void;
};

export function MoodPicker({ visible, onPick, onDismiss }: MoodPickerProps) {
  const { t } = useTranslation();

  function handlePick(moodId: string) {
    hapticSuccess();
    onPick(moodId);
  }

  return (
    <AppSheet
      testID="capture:mood:sheet"
      visible={visible}
      snapPoints={['44%', '78%']}
      onDismiss={onDismiss}
    >
      <View className="px-lg pb-4xl pt-sm">
        <Heading className="mb-1 text-center text-xl">{t('capture.mood.title')}</Heading>
        <Body className="mb-6 text-center text-muted">{t('capture.mood.subtitle')}</Body>
        <View className="flex-row flex-wrap justify-center" style={{ gap: 10 }}>
          {MOOD_OPTIONS.map((m) => (
            <Animated.View
              key={m.id}
              layout={Layout.springify().damping(18)}
              className="min-w-[30%] max-w-[46%] flex-1"
            >
              <AnimatedPressable
                key={m.id}
                testID={`capture:mood:${m.id}`}
                haptic
                onPressIn={() => {
                  hapticSelection();
                }}
                onPress={() => {
                  handlePick(m.id);
                }}
                accessibilityRole="button"
                accessibilityLabel={t(`moods.${m.id}`)}
                className="flex-row items-center gap-2 rounded-2xl border border-borderSubtle bg-surfaceElevated px-3 py-3"
              >
                <Text className="text-2xl">{m.emoji}</Text>
                <Caption className="flex-1 text-sm text-secondary" numberOfLines={2}>
                  {t(`moods.${m.id}`)}
                </Caption>
              </AnimatedPressable>
            </Animated.View>
          ))}
        </View>
      </View>
    </AppSheet>
  );
}
