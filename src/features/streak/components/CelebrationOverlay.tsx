import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Body, Heading } from '@/components/Typography';
import { colors } from '@/theme/colors';

import { BADGE_DISPLAY, type BadgeTypeId } from '../constants/badgeTypes';

type Props = {
  visible: boolean;
  badgeType: BadgeTypeId | null;
  onDismiss: () => void;
};

export function CelebrationOverlay({ visible, badgeType, onDismiss }: Props) {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();

  useEffect(() => {
    if (!visible || !badgeType) {
      return;
    }
    const id = setTimeout(() => {
      onDismiss();
    }, 2600);
    return () => clearTimeout(id);
  }, [visible, badgeType, onDismiss]);

  if (!badgeType) {
    return null;
  }

  const def = BADGE_DISPLAY[badgeType];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <Pressable
        testID="celebration:backdrop"
        className="flex-1 items-center justify-center bg-black/75"
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel={t('celebration.dismissA11y')}
      >
        <Animated.View
          entering={FadeIn.duration(280)}
          pointerEvents="none"
          style={{ position: 'absolute', inset: 0 }}
        >
          {Array.from({ length: 18 }, (_, i) => {
            const left = ((i * 53) % Math.max(1, width - 24)) + 8;
            const top = ((i * 37) % Math.max(1, Math.floor(height * 0.55))) + 8;
            return (
              <Animated.View
                key={i}
                entering={FadeIn.delay(i * 30).duration(400)}
                style={{
                  position: 'absolute',
                  left,
                  top,
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  backgroundColor:
                    i % 3 === 0
                      ? colors.accentOrange
                      : i % 3 === 1
                        ? colors.accentBlue
                        : colors.success,
                  opacity: 0.85,
                }}
              />
            );
          })}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.springify().damping(18)}
          className="mx-6 items-center rounded-3xl border border-white/15 bg-surface px-8 py-10"
        >
          <Body className="mb-4 text-6xl">{def.emoji}</Body>
          <Heading className="mb-2 text-center text-xl">{t('celebration.title')}</Heading>
          <Body className="mb-1 text-center text-lg font-semibold text-white">
            {t(def.nameKey)}
          </Body>
          <Body className="max-w-xs text-center text-muted">{t(def.descriptionKey)}</Body>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
