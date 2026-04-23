import DateTimePicker from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useIsFocused } from '@react-navigation/native';
import { AuthorizationStatus } from '@notifee/react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useMicrophonePermission,
} from 'react-native-vision-camera';

import { Body, Heading } from '@/components/Typography';
import { SafeScreen } from '@/components/SafeScreen';
import { useCreateCapsule } from '@/features/capsule/hooks/useCreateCapsule';
import { isCapsuleContentValid, isUnlockDateInTheFuture } from '@/features/capsule/logic/capsuleStatus';
import { useNotificationPermission } from '@/features/notification';
import { colors } from '@/theme/colors';
import { hapticLight } from '@/utils/haptics';
import { persistJournalMedia } from '@/utils/persistJournalMedia';

import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CapsuleCreate'>;

type InputMode = 'text' | 'media';
type MediaMode = 'video' | 'photo';

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function minPickerDate(now: Date = new Date()): Date {
  const nineAm = new Date(now);
  nineAm.setHours(9, 0, 0, 0);
  if (now.getTime() < nineAm.getTime()) {
    return startOfDay(now);
  }
  const t = new Date(now);
  t.setDate(t.getDate() + 1);
  t.setHours(0, 0, 0, 0);
  return t;
}

function unlockAtFromPickedDate(picked: Date): Date {
  const x = new Date(picked);
  x.setHours(9, 0, 0, 0);
  return x;
}

export function CapsuleCreateScreen({ navigation, route }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { goalId } = route.params;
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const isFocused = useIsFocused();

  const { hasPermission: hasCamPermission, requestPermission: requestCamPermission } =
    useCameraPermission();
  const { hasPermission: hasMicPermission, requestPermission: requestMicPermission } =
    useMicrophonePermission();

  const { create, isLoading: saving } = useCreateCapsule();
  const { request: requestNotif, authorizationStatus: notifAuth } = useNotificationPermission();

  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [mediaMode, setMediaMode] = useState<MediaMode>('video');
  const [isRecording, setIsRecording] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [textBody, setTextBody] = useState('');
  const [title, setTitle] = useState('');
  const [unlockPicked, setUnlockPicked] = useState(() => minPickerDate());
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCameraActive =
    isFocused && inputMode === 'media' && hasCamPermission && device != null;

  const unlocksAt = useMemo(() => unlockAtFromPickedDate(unlockPicked), [unlockPicked]);

  const takePhoto = useCallback(async () => {
    const cam = cameraRef.current;
    if (!cam) return;
    try {
      const photo = await cam.takePhoto();
      const persisted = persistJournalMedia(photo.path, 'jpg');
      setPendingPath(persisted);
    } catch (e) {
      console.error('[CapsuleCreate] takePhoto', e);
    }
  }, []);

  const toggleRecording = useCallback(async () => {
    const cam = cameraRef.current;
    if (!cam) return;

    if (isRecording) {
      try {
        await cam.stopRecording();
      } catch (e) {
        console.error('[CapsuleCreate] stopRecording', e);
        setIsRecording(false);
      }
      return;
    }

    if (!hasMicPermission) {
      const mic = await requestMicPermission();
      if (!mic) return;
    }

    setIsRecording(true);
    cam.startRecording({
      onRecordingFinished: (video) => {
        setIsRecording(false);
        try {
          setPendingPath(persistJournalMedia(video.path, 'mp4'));
        } catch (e) {
          console.error('[CapsuleCreate] persist video', e);
        }
      },
      onRecordingError: (err) => {
        setIsRecording(false);
        console.error('[CapsuleCreate] recording', err);
      },
    });
  }, [hasMicPermission, isRecording, requestMicPermission]);

  const onShutter = useCallback(() => {
    if (mediaMode === 'photo') {
      void takePhoto();
    } else {
      void toggleRecording();
    }
  }, [mediaMode, takePhoto, toggleRecording]);

  const saveEnabled = useMemo(() => {
    if (!title.trim()) {
      return false;
    }
    if (inputMode === 'text') {
      return textBody.trim().length > 0;
    }
    return (pendingPath != null && pendingPath.length > 0) || textBody.trim().length > 0;
  }, [inputMode, pendingPath, textBody, title]);

  const onSave = useCallback(async () => {
    hapticLight();
    setError(null);
    if (
      !isCapsuleContentValid({
        title,
        mediaPath: inputMode === 'media' && pendingPath ? pendingPath : undefined,
        text: textBody.trim() || undefined,
      })
    ) {
      return;
    }
    const now = new Date();
    if (!isUnlockDateInTheFuture(unlocksAt, now)) {
      setError(t('capsule.create.dateMustBeFuture'));
      return;
    }
    if (
      notifAuth !== AuthorizationStatus.AUTHORIZED &&
      notifAuth !== AuthorizationStatus.PROVISIONAL
    ) {
      await requestNotif();
    }
    try {
      const mediaPath = inputMode === 'media' && pendingPath ? pendingPath : undefined;
      const text = textBody.trim() || undefined;
      await create({
        goalId,
        title: title.trim(),
        mediaPath,
        text,
        unlocksAt,
      });
      navigation.goBack();
    } catch (e) {
      console.error('[CapsuleCreate] create', e);
      setError(t('common.error'));
    }
  }, [create, goalId, inputMode, navigation, notifAuth, pendingPath, requestNotif, t, textBody, title, unlocksAt]);

  const needCamera = inputMode === 'media';

  if (needCamera && !hasCamPermission) {
    return (
      <SafeScreen testID="capsule:create:permission">
        <View className="flex-1 justify-center px-6" style={{ paddingTop: insets.top }}>
          <Heading className="mb-2">{t('capture.permission.title')}</Heading>
          <Body className="mb-6 text-slate-400">{t('capture.permission.cameraBody')}</Body>
          <Pressable
            testID="capsule:create:request-cam"
            onPress={() => {
              void requestCamPermission();
            }}
            className="items-center rounded-xl bg-blue-600 py-4"
            accessibilityRole="button"
            accessibilityLabel={t('capture.permission.cta')}
          >
            <Body className="font-semibold text-white">{t('capture.permission.cta')}</Body>
          </Pressable>
        </View>
      </SafeScreen>
    );
  }

  if (needCamera && device == null) {
    return (
      <SafeScreen testID="capsule:create:no-device">
        <View className="flex-1 justify-center px-6">
          <Body>{t('capture.noDevice')}</Body>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen testID="capsule:create:root">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24, paddingTop: 8 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-4 flex-row items-center justify-between">
          <Pressable
            testID="capsule:create:cancel"
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel={t('capsule.create.cancel')}
          >
            <Body className="text-slate-400">{t('capsule.create.cancel')}</Body>
          </Pressable>
        </View>

        <Heading className="mb-2">{t('capsule.create.title')}</Heading>

        <TextInput
          testID="capsule:create:title-input"
          value={title}
          onChangeText={setTitle}
          placeholder={t('capsule.create.titlePlaceholder')}
          placeholderTextColor={colors.textMuted}
          className="mb-3 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-base text-white"
        />

        <Body className="mb-2 text-slate-400">{t('capsule.create.mediaHint')}</Body>
        <View className="mb-4 flex-row gap-2">
          <Pressable
            testID="capsule:create:mode-text"
            onPress={() => {
              setInputMode('text');
              setPendingPath(null);
            }}
            className={`flex-1 rounded-xl py-2 ${inputMode === 'text' ? 'bg-blue-600' : 'bg-slate-800'}`}
            accessibilityRole="button"
            accessibilityLabel={t('capsule.create.textMode')}
          >
            <Body className="text-center font-medium text-white">{t('capsule.create.textMode')}</Body>
          </Pressable>
          <Pressable
            testID="capsule:create:mode-media"
            onPress={() => setInputMode('media')}
            className={`flex-1 rounded-xl py-2 ${inputMode === 'media' ? 'bg-blue-600' : 'bg-slate-800'}`}
            accessibilityRole="button"
            accessibilityLabel={t('capsule.create.mediaMode')}
          >
            <Body className="text-center font-medium text-white">{t('capsule.create.mediaMode')}</Body>
          </Pressable>
        </View>

        {inputMode === 'text' ? (
          <TextInput
            testID="capsule:create:text-input"
            value={textBody}
            onChangeText={setTextBody}
            multiline
            placeholder={t('capsule.create.textPlaceholder')}
            placeholderTextColor={colors.textMuted}
            className="mb-4 min-h-[120px] rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-base text-white"
            textAlignVertical="top"
          />
        ) : (
          <View className="mb-4">
            <View className="mb-2 h-64 overflow-hidden rounded-2xl bg-black">
              <Camera
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device!}
                isActive={isCameraActive}
                photo
                video
                audio={mediaMode === 'video'}
              />
            </View>
            <View className="mb-2 flex-row justify-center gap-2">
              <Pressable
                testID="capsule:create:media-video"
                onPress={() => setMediaMode('video')}
                className={`rounded-full px-4 py-2 ${mediaMode === 'video' ? 'bg-white' : 'bg-slate-700'}`}
                accessibilityLabel={t('capture.mode.video')}
              >
                <Body className={mediaMode === 'video' ? 'text-black' : 'text-white'}>
                  {t('capture.mode.video')}
                </Body>
              </Pressable>
              <Pressable
                testID="capsule:create:media-photo"
                onPress={() => setMediaMode('photo')}
                className={`rounded-full px-4 py-2 ${mediaMode === 'photo' ? 'bg-white' : 'bg-slate-700'}`}
                accessibilityLabel={t('capture.mode.photo')}
              >
                <Body className={mediaMode === 'photo' ? 'text-black' : 'text-white'}>
                  {t('capture.mode.photo')}
                </Body>
              </Pressable>
            </View>
            {pendingPath ? (
              <Body className="mb-2 text-green-400" testID="capsule:create:media-captured">
                {t('capsule.create.captureReady')}
              </Body>
            ) : null}
            <View className="items-center">
              <Pressable
                testID="capsule:create:shutter"
                onPress={onShutter}
                disabled={saving}
                accessibilityLabel={
                  mediaMode === 'photo' ? t('capture.shutter.photo') : t('capture.shutter.record')
                }
                className={`h-16 w-16 items-center justify-center rounded-full border-4 border-white ${
                  isRecording ? 'bg-red-500' : 'bg-white/20'
                }`}
              >
                <View
                  className={`rounded-full bg-white ${
                    mediaMode === 'video' && isRecording ? 'h-4 w-4' : 'h-12 w-12'
                  }`}
                />
              </Pressable>
            </View>
            <TextInput
              testID="capsule:create:optional-text"
              value={textBody}
              onChangeText={setTextBody}
              multiline
              placeholder={t('capsule.create.textPlaceholder')}
              placeholderTextColor={colors.textMuted}
              className="mt-4 min-h-[72px] rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-300"
              textAlignVertical="top"
            />
          </View>
        )}

        <Body className="mb-1 mt-2 text-slate-300">{t('capsule.create.unlockDateLabel')}</Body>
        {Platform.OS === 'android' ? (
          <>
            <Pressable
              testID="capsule:create:open-date"
              onPress={() => setShowPicker(true)}
              className="mb-2 rounded-xl border border-slate-700 bg-slate-900/80 py-3"
            >
              <Body className="text-center text-white">
                {unlockPicked.toLocaleDateString()}
              </Body>
            </Pressable>
            {showPicker ? (
              <DateTimePicker
                testID="capsule:create:date-picker"
                value={unlockPicked}
                mode="date"
                display="default"
                minimumDate={minPickerDate()}
                onChange={(event, date) => {
                  setShowPicker(false);
                  if (event.type === 'set' && date) {
                    setUnlockPicked(date);
                  }
                }}
              />
            ) : null}
          </>
        ) : (
          <View className="mb-4">
            <DateTimePicker
              testID="capsule:create:date-picker"
              value={unlockPicked}
              mode="date"
              display="spinner"
              themeVariant="dark"
              minimumDate={minPickerDate()}
              onChange={(_, date) => {
                if (date) {
                  setUnlockPicked(date);
                }
              }}
            />
          </View>
        )}

        {error ? <Body className="mb-2 text-amber-400">{error}</Body> : null}

        <Pressable
          testID="capsule:create:save"
          onPress={() => {
            void onSave();
          }}
          disabled={!saveEnabled || saving}
          className={`items-center rounded-xl py-4 ${saveEnabled && !saving ? 'bg-orange-500' : 'bg-slate-700'}`}
          accessibilityRole="button"
          accessibilityLabel={t('capsule.create.save')}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Body className="font-semibold text-white">{t('capsule.create.save')}</Body>
          )}
        </Pressable>
      </ScrollView>
    </SafeScreen>
  );
}
