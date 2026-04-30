import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Video, ResizeMode } from 'expo-av';
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, Share, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/PrimaryButton';
import { SecondaryButton } from '@/components/SecondaryButton';
import { Body, Heading } from '@/components/Typography';
import { CollageProgressView } from '@/features/collage/components/CollageProgressView';
import { useGenerateCollage } from '@/features/collage/hooks/useGenerateCollage';
import type { RootStackParamList } from '@/navigation/types';
import { hapticSuccess } from '@/utils/haptics';

export function CollagePremiereScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'CollageFinale'>>();
  const { goalId } = route.params;

  const { status, progress, outputPath, errorKind, loadFromCache, generate, cancel } =
    useGenerateCollage(goalId);

  const videoRef = useRef<Video>(null);
  const playedHapticRef = useRef(false);

  useEffect(() => {
    return () => {
      void FFmpegKit.cancel();
    };
  }, []);

  useEffect(() => {
    if (loadFromCache()) {
      return;
    }
    void generate();
  }, [goalId, loadFromCache, generate]);

  const onReplay = useCallback(async () => {
    playedHapticRef.current = false;
    try {
      await videoRef.current?.replayAsync();
    } catch {
      /* ignore */
    }
  }, []);

  const onShare = useCallback(async () => {
    if (!outputPath) return;
    try {
      await Share.share({
        title: t('collage.premiere.share'),
        url: outputPath,
      });
    } catch (e) {
      console.error('[CollagePremiereScreen] share failed', e);
    }
  }, [outputPath, t]);

  if (status === 'generating' || status === 'idle') {
    return (
      <CollageProgressView
        progress={progress}
        onCancel={() => {
          cancel();
        }}
      />
    );
  }

  if (status === 'error') {
    const errMessage =
      errorKind === 'noMedia'
        ? t('collage.error.noMedia')
        : errorKind === 'cancelled'
          ? t('collage.error.cancelled')
          : t('collage.error.assembly');
    return (
      <View
        className="flex-1 justify-center bg-canvas px-6"
        style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }}
        testID="collage:premiere:error"
      >
        <Heading className="mb-3 text-center text-xl">{errMessage}</Heading>
        <PrimaryButton
          testID="collage:premiere:retry"
          accessibilityLabel={t('collage.premiere.retryA11y')}
          onPress={() => {
            void generate();
          }}
          className="mt-4"
          gradient
        >
          {t('collage.premiere.retry')}
        </PrimaryButton>
        <SecondaryButton
          testID="collage:premiere:close-error"
          accessibilityLabel={t('collage.premiere.closeA11y')}
          onPress={() => navigation.goBack()}
          className="mt-4"
        >
          {t('collage.premiere.close')}
        </SecondaryButton>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black" testID="collage:premiere:root">
      <Animated.View
        entering={FadeIn.duration(280)}
        style={{ paddingTop: insets.top }}
        className="absolute left-0 right-0 z-10 flex-row justify-between px-4"
      >
        <Pressable
          testID="collage:premiere:close"
          accessibilityRole="button"
          accessibilityLabel={t('collage.premiere.closeA11y')}
          onPress={() => navigation.goBack()}
          className="rounded-full bg-black/50 px-4 py-2"
        >
          <Body className="font-semibold text-white">{t('collage.premiere.close')}</Body>
        </Pressable>
        <Pressable
          testID="collage:premiere:share"
          accessibilityRole="button"
          accessibilityLabel={t('collage.premiere.share')}
          onPress={onShare}
          className="rounded-full bg-black/50 px-4 py-2"
        >
          <Body className="font-semibold text-white">{t('collage.premiere.share')}</Body>
        </Pressable>
      </Animated.View>

      {outputPath ? (
        <Video
          ref={videoRef}
          source={{ uri: outputPath }}
          style={{ flex: 1 }}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay
          useNativeControls={false}
          onPlaybackStatusUpdate={(s) => {
            if (!s.isLoaded || playedHapticRef.current) {
              return;
            }
            if (s.isPlaying) {
              playedHapticRef.current = true;
              hapticSuccess();
            }
          }}
        />
      ) : null}

      <Animated.View
        entering={FadeInDown.duration(320)}
        style={{ paddingBottom: insets.bottom + 12 }}
        className="absolute bottom-0 left-0 right-0 items-center px-6"
      >
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={24}
            tint="dark"
            className="absolute bottom-0 left-4 right-4 top-0 rounded-3xl overflow-hidden"
          />
        ) : null}
        <Pressable
          testID="collage:premiere:replay"
          accessibilityRole="button"
          accessibilityLabel={t('collage.premiere.replay')}
          onPress={onReplay}
          className="w-full items-center rounded-2xl border border-white/30 bg-black/60 py-4"
        >
          <Body className="font-semibold text-white">{t('collage.premiere.replay')}</Body>
        </Pressable>
      </Animated.View>
    </View>
  );
}
