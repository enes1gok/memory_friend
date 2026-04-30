import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SecondaryButton } from '@/components/SecondaryButton';
import { Body, Heading } from '@/components/Typography';
import { colors } from '@/theme/colors';

type Props = {
  progress: number;
  onCancel: () => void;
};

export function CollageProgressView({ progress, onCancel }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const pulse = useSharedValue(0.35);

  pulse.value = withRepeat(
    withSequence(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      withTiming(0.35, { duration: 900, easing: Easing.inOut(Easing.ease) }),
    ),
    -1,
    false,
  );

  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, Math.max(8, progress * 100))}%`,
    opacity: pulse.value,
  }));

  const label =
    progress < 0.45
      ? t('collage.progress.preparing')
      : progress < 0.72
        ? t('collage.progress.merging')
        : t('collage.progress.finishing');

  return (
    <View
      className="flex-1 justify-center bg-canvas px-6"
      style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }}
      testID="collage:progress:root"
    >
      <Heading className="mb-2 text-center text-2xl" accessibilityRole="header">
        {t('collage.progress.title')}
      </Heading>
      <Body className="mb-8 text-center text-muted">{label}</Body>

      <View className="mb-10 h-3 overflow-hidden rounded-full bg-surfaceElevated">
        <Animated.View className="h-full overflow-hidden rounded-full" style={barStyle}>
          <LinearGradient
            colors={[colors.accentBlue, colors.accentOrange]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      </View>

      <SecondaryButton
        testID="collage:progress:cancel"
        accessibilityRole="button"
        accessibilityLabel={t('collage.progress.cancel')}
        onPress={onCancel}
      >
        {t('collage.progress.cancel')}
      </SecondaryButton>
    </View>
  );
}
