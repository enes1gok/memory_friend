import { useIsFocused } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useMicrophonePermission,
} from 'react-native-vision-camera';

import { PrimaryButton } from '@/components/PrimaryButton';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Body, Caption, Heading } from '@/components/Typography';
import { useEnrichJournalEntry } from '@/features/ai/hooks/useEnrichJournalEntry';
import { MoodPicker } from '@/features/journal/components/MoodPicker';
import { useSaveJournalEntry } from '@/features/journal/hooks/useSaveJournalEntry';
import { CelebrationOverlay } from '@/features/streak/components/CelebrationOverlay';
import type { BadgeTypeId } from '@/features/streak/constants/badgeTypes';
import { pickBestNewBadge } from '@/features/streak/logic/pickBestNewBadge';
import { colors } from '@/theme/colors';
import { useUIStore } from '@/stores/useUIStore';
import { hapticSuccess } from '@/utils/haptics';
import { persistJournalMedia } from '@/utils/persistJournalMedia';

type CaptureMode = 'video' | 'photo';

type PendingMedia = {
  path: string;
  type: 'video' | 'photo';
};

function formatDuration(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
}

function AnimatedShutter({ mode, isRecording }: { mode: CaptureMode; isRecording: boolean }) {
  const outerStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(isRecording ? colors.error : colors.textPrimary, { duration: 180 }),
    transform: [{ scale: withTiming(isRecording ? 1.08 : 1, { duration: 180 }) }],
  }));

  const innerStyle = useAnimatedStyle(() => ({
    width: withTiming(mode === 'video' && isRecording ? 24 : 64, { duration: 180 }),
    height: withTiming(mode === 'video' && isRecording ? 24 : 64, { duration: 180 }),
    borderRadius: withTiming(mode === 'video' && isRecording ? 7 : 32, { duration: 180 }),
    backgroundColor: mode === 'video' && isRecording ? colors.error : colors.textPrimary,
  }));

  return (
    <Animated.View
      className="h-20 w-20 items-center justify-center rounded-full border-4 bg-white/20"
      style={outerStyle}
    >
      <Animated.View style={innerStyle} />
    </Animated.View>
  );
}

export function CaptureScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const isFocused = useIsFocused();

  const { hasPermission: hasCamPermission, requestPermission: requestCamPermission } =
    useCameraPermission();
  const { hasPermission: hasMicPermission, requestPermission: requestMicPermission } =
    useMicrophonePermission();

  const [mode, setMode] = useState<CaptureMode>('video');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [pendingMedia, setPendingMedia] = useState<PendingMedia | null>(null);
  const [saving, setSaving] = useState(false);
  const [celebrationBadge, setCelebrationBadge] = useState<BadgeTypeId | null>(null);
  const [celebrationOpen, setCelebrationOpen] = useState(false);

  const saveJournalEntry = useSaveJournalEntry();
  const { triggerEnrichment } = useEnrichJournalEntry();
  const setHypeManFromCapturePending = useUIStore((s) => s.setHypeManFromCapturePending);

  const showMoodPicker = pendingMedia !== null;
  const isActive = isFocused && !showMoodPicker && !saving;

  useEffect(() => {
    if (!isRecording) {
      setRecordingSeconds(0);
      return;
    }
    const startedAt = Date.now();
    const id = setInterval(() => {
      setRecordingSeconds(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    }, 250);
    return () => clearInterval(id);
  }, [isRecording]);

  const onMoodPick = useCallback(
    async (moodTag: string) => {
      if (!pendingMedia) return;
      setSaving(true);
      try {
        const { entryId, newBadges } = await saveJournalEntry({
          mediaPath: pendingMedia.path,
          mediaType: pendingMedia.type,
          moodTag,
        });
        triggerEnrichment({
          entryId,
          mediaPath: pendingMedia.path,
          mediaType: pendingMedia.type,
        });
        setPendingMedia(null);
        const best = pickBestNewBadge(newBadges);
        if (best) {
          hapticSuccess();
          setCelebrationBadge(best);
          setCelebrationOpen(true);
        }
      } catch (e) {
        console.error('[CaptureScreen] save journal entry failed', e);
      } finally {
        setSaving(false);
      }
    },
    [pendingMedia, saveJournalEntry, triggerEnrichment],
  );

  const dismissMoodFlow = useCallback(() => {
    if (!saving) {
      setPendingMedia(null);
    }
  }, [saving]);

  const takePhoto = useCallback(async () => {
    const cam = cameraRef.current;
    if (!cam) return;
    try {
      const photo = await cam.takePhoto();
      const persisted = persistJournalMedia(photo.path, 'jpg');
      setPendingMedia({ path: persisted, type: 'photo' });
    } catch (e) {
      console.error('[CaptureScreen] takePhoto failed', e);
    }
  }, []);

  const toggleRecording = useCallback(async () => {
    const cam = cameraRef.current;
    if (!cam) return;

    if (isRecording) {
      try {
        await cam.stopRecording();
      } catch (e) {
        console.error('[CaptureScreen] stopRecording failed', e);
        setIsRecording(false);
      }
      return;
    }

    if (!hasMicPermission) {
      const mic = await requestMicPermission();
      if (!mic) {
        return;
      }
    }

    setIsRecording(true);
    cam.startRecording({
      onRecordingFinished: (video) => {
        setIsRecording(false);
        try {
          const persisted = persistJournalMedia(video.path, 'mp4');
          setPendingMedia({ path: persisted, type: 'video' });
        } catch (e) {
          console.error('[CaptureScreen] persist video failed', e);
        }
      },
      onRecordingError: (err) => {
        setIsRecording(false);
        console.error('[CaptureScreen] recording error', err);
      },
    });
  }, [hasMicPermission, isRecording, requestMicPermission]);

  const onCapturePress = useCallback(() => {
    if (mode === 'photo') {
      void takePhoto();
    } else {
      void toggleRecording();
    }
  }, [mode, takePhoto, toggleRecording]);

  if (!hasCamPermission) {
    return (
      <View
        testID="capture:screen:permission"
        className="flex-1 justify-center px-6"
        style={{ backgroundColor: colors.canvas, paddingTop: insets.top }}
      >
        <Heading className="mb-2">{t('capture.permission.title')}</Heading>
        <Body className="mb-6 text-muted">{t('capture.permission.cameraBody')}</Body>
        <PrimaryButton
          testID="capture:permission:request"
          onPress={() => {
            void requestCamPermission();
          }}
          gradient
          accessibilityLabel={t('capture.permission.openSettings')}
        >
          {t('capture.permission.cta')}
        </PrimaryButton>
      </View>
    );
  }

  if (device == null) {
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: colors.canvas }}
      >
        <Body>{t('capture.noDevice')}</Body>
      </View>
    );
  }

  return (
    <View testID="capture:screen:root" className="flex-1 bg-black">
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        photo
        video
        audio={mode === 'video'}
      />

      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0.72)', 'transparent']}
        style={[StyleSheet.absoluteFill, { bottom: undefined, height: 150 }]}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['transparent', 'rgba(0,0,0,0.72)']}
        style={[StyleSheet.absoluteFill, { top: undefined, height: 190 }]}
      />

      <View
        className="absolute left-0 right-0 px-4"
        style={{ top: insets.top + 8 }}
        pointerEvents="box-none"
      >
        <Caption className="mb-2 text-center text-sm text-white/90">{t('capture.prompt')}</Caption>
        {isRecording ? (
          <Caption className="mb-2 text-center text-sm font-semibold text-error">
            {formatDuration(recordingSeconds)}
          </Caption>
        ) : null}
        <SegmentedControl
          testID="capture:mode"
          disabled={isRecording}
          value={mode}
          options={[
            { value: 'video', label: t('capture.mode.video') },
            { value: 'photo', label: t('capture.mode.photo') },
          ]}
          onChange={setMode}
        />
      </View>

      <View
        className="absolute left-0 right-0 flex-row items-center justify-center gap-6"
        style={{ bottom: insets.bottom + 24 }}
        pointerEvents="box-none"
      >
        <Pressable
          testID="capture:shutter:press"
          onPress={onCapturePress}
          disabled={saving}
          accessibilityRole="button"
          accessibilityLabel={
            mode === 'photo' ? t('capture.shutter.photo') : t('capture.shutter.record')
          }
          className="h-20 w-20 items-center justify-center rounded-full"
        >
          {saving ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <AnimatedShutter mode={mode} isRecording={isRecording} />
          )}
        </Pressable>
      </View>

      <MoodPicker visible={showMoodPicker} onPick={onMoodPick} onDismiss={dismissMoodFlow} />

      {saving && showMoodPicker ? (
        <View
          className="absolute inset-0 items-center justify-center bg-black/40"
          pointerEvents="none"
        >
          <ActivityIndicator size="large" color={colors.textPrimary} />
        </View>
      ) : null}

      <CelebrationOverlay
        visible={celebrationOpen && celebrationBadge != null}
        badgeType={celebrationBadge}
        onDismiss={() => {
          if (celebrationBadge) {
            setHypeManFromCapturePending(true);
          }
          setCelebrationOpen(false);
          setCelebrationBadge(null);
        }}
      />
    </View>
  );
}
