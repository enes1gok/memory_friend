import { useIsFocused } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useMicrophonePermission,
} from 'react-native-vision-camera';

import { Body, Heading } from '@/components/Typography';
import { MoodPicker } from '@/features/journal/components/MoodPicker';
import { useSaveJournalEntry } from '@/features/journal/hooks/useSaveJournalEntry';
import { colors } from '@/theme/colors';
import { persistJournalMedia } from '@/utils/persistJournalMedia';

type CaptureMode = 'video' | 'photo';

type PendingMedia = {
  path: string;
  type: 'video' | 'photo';
};

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
  const [pendingMedia, setPendingMedia] = useState<PendingMedia | null>(null);
  const [saving, setSaving] = useState(false);

  const saveJournalEntry = useSaveJournalEntry();

  const showMoodPicker = pendingMedia !== null;
  const isActive = isFocused && !showMoodPicker && !saving;

  const onMoodPick = useCallback(
    async (moodTag: string) => {
      if (!pendingMedia) return;
      setSaving(true);
      try {
        await saveJournalEntry({
          mediaPath: pendingMedia.path,
          mediaType: pendingMedia.type,
          moodTag,
        });
        setPendingMedia(null);
      } catch (e) {
        console.error('[CaptureScreen] save journal entry failed', e);
      } finally {
        setSaving(false);
      }
    },
    [pendingMedia, saveJournalEntry],
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
        style={{ backgroundColor: colors.background, paddingTop: insets.top }}
      >
        <Heading className="mb-2">{t('capture.permission.title')}</Heading>
        <Body className="mb-6 text-slate-400">{t('capture.permission.cameraBody')}</Body>
        <Pressable
          testID="capture:permission:request"
          onPress={() => {
            void requestCamPermission();
          }}
          accessibilityRole="button"
          accessibilityLabel={t('capture.permission.openSettings')}
          className="items-center rounded-xl bg-blue-600 py-4"
        >
          <Body className="font-semibold text-white">{t('capture.permission.cta')}</Body>
        </Pressable>
      </View>
    );
  }

  if (device == null) {
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: colors.background }}
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

      <View
        className="absolute left-0 right-0 px-4"
        style={{ top: insets.top + 8 }}
        pointerEvents="box-none"
      >
        <View className="flex-row justify-center gap-2 rounded-full bg-black/50 p-1">
          <Pressable
            testID="capture:mode:video"
            onPress={() => {
              setMode('video');
            }}
            disabled={isRecording}
            className={`flex-1 rounded-full py-2 ${mode === 'video' ? 'bg-white' : ''}`}
            accessibilityRole="button"
            accessibilityLabel={t('capture.mode.video')}
          >
            <Body
              className={`text-center text-sm font-semibold ${mode === 'video' ? 'text-black' : 'text-white'}`}
            >
              {t('capture.mode.video')}
            </Body>
          </Pressable>
          <Pressable
            testID="capture:mode:photo"
            onPress={() => {
              setMode('photo');
            }}
            disabled={isRecording}
            className={`flex-1 rounded-full py-2 ${mode === 'photo' ? 'bg-white' : ''}`}
            accessibilityRole="button"
            accessibilityLabel={t('capture.mode.photo')}
          >
            <Body
              className={`text-center text-sm font-semibold ${mode === 'photo' ? 'text-black' : 'text-white'}`}
            >
              {t('capture.mode.photo')}
            </Body>
          </Pressable>
        </View>
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
          className={`h-20 w-20 items-center justify-center rounded-full border-4 border-white ${
            isRecording ? 'bg-red-500' : 'bg-white/20'
          }`}
        >
          {saving ? (
            <ActivityIndicator color={colors.textPrimary} />
          ) : (
            <View
              className={`rounded-full bg-white ${mode === 'video' && isRecording ? 'h-6 w-6' : 'h-16 w-16'}`}
            />
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
    </View>
  );
}
