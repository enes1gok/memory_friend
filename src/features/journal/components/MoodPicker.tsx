import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

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

  if (!visible) {
    return null;
  }

  function handlePick(moodId: string) {
    hapticSuccess();
    onPick(moodId);
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Animated.View entering={FadeIn} className="flex-1 justify-end bg-black/70">
        <Pressable className="flex-1" onPress={onDismiss} accessibilityRole="button" />
        <Animated.View
          entering={FadeInUp.duration(320)}
          className="rounded-t-3xl bg-surface px-4 pb-10 pt-6"
        >
          <Heading className="mb-1 text-center text-xl">{t('capture.mood.title')}</Heading>
          <Body className="mb-6 text-center text-muted">{t('capture.mood.subtitle')}</Body>
          <View className="flex-row flex-wrap justify-center" style={{ gap: 10 }}>
            {MOOD_OPTIONS.map((m) => (
              <Pressable
                key={m.id}
                testID={`capture:mood:${m.id}`}
                onPressIn={() => {
                  hapticSelection();
                }}
                onPress={() => {
                  handlePick(m.id);
                }}
                accessibilityRole="button"
                accessibilityLabel={t(`moods.${m.id}`)}
                className="min-w-[30%] max-w-[46%] flex-1 flex-row items-center gap-2 rounded-2xl border border-white/10 bg-surfaceElevated px-3 py-3"
              >
                <Text className="text-2xl">{m.emoji}</Text>
                <Caption className="flex-1 text-sm text-secondary" numberOfLines={2}>
                  {t(`moods.${m.id}`)}
                </Caption>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
