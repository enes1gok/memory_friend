import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Body, Heading } from '@/components/Typography';

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
      <Body className="mb-8 text-center text-slate-400">{label}</Body>

      <View className="mb-10 h-3 overflow-hidden rounded-full bg-slate-800">
        <Animated.View className="h-full rounded-full bg-orange-500" style={barStyle} />
      </View>

      <Pressable
        testID="collage:progress:cancel"
        accessibilityRole="button"
        accessibilityLabel={t('collage.progress.cancel')}
        onPress={onCancel}
        className="items-center rounded-2xl border border-slate-600 py-4"
      >
        <Body className="font-semibold text-slate-200">{t('collage.progress.cancel')}</Body>
      </Pressable>
    </View>
  );
}
