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
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useMicrophonePermission,
} from 'react-native-vision-camera';

import { AppTextInput } from '@/components/AppTextInput';
import { Body, Heading } from '@/components/Typography';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SafeScreen } from '@/components/SafeScreen';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useCreateCapsule } from '@/features/capsule/hooks/useCreateCapsule';
import { isCapsuleContentValid, isUnlockDateInTheFuture } from '@/features/capsule/logic/capsuleStatus';
import { useNotificationPermission } from '@/features/notification';
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

function datePlusDays(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0);
  return d;
}

function datePlusMonths(months: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  d.setHours(12, 0, 0, 0);
  return d;
}

function daysFromToday(date: Date): number {
  const today = startOfDay(new Date()).getTime();
  const picked = startOfDay(date).getTime();
  return Math.round((picked - today) / (24 * 60 * 60 * 1000));
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
          <Body className="mb-6 text-muted">{t('capture.permission.cameraBody')}</Body>
          <PrimaryButton
            testID="capsule:create:request-cam"
            onPress={() => {
              void requestCamPermission();
            }}
            gradient
            accessibilityLabel={t('capture.permission.cta')}
          >
            {t('capture.permission.cta')}
          </PrimaryButton>
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
            <Body className="text-muted">{t('capsule.create.cancel')}</Body>
          </Pressable>
        </View>

        <Heading className="mb-2">{t('capsule.create.title')}</Heading>

        <AppTextInput
          testID="capsule:create:title-input"
          value={title}
          onChangeText={setTitle}
          placeholder={t('capsule.create.titlePlaceholder')}
          style={{ marginBottom: 12 }}
        />

        <Body className="mb-2 text-muted">{t('capsule.create.mediaHint')}</Body>
        <View className="mb-4">
          <SegmentedControl
            testID="capsule:create:mode"
            value={inputMode}
            options={[
              { value: 'text', label: t('capsule.create.textMode') },
              { value: 'media', label: t('capsule.create.mediaMode') },
            ]}
            onChange={(next) => {
              setInputMode(next);
              if (next === 'text') {
                setPendingPath(null);
              }
            }}
          />
        </View>

        {inputMode === 'text' ? (
          <AppTextInput
            testID="capsule:create:text-input"
            value={textBody}
            onChangeText={setTextBody}
            multiline
            placeholder={t('capsule.create.textPlaceholder')}
            style={{ marginBottom: 16, minHeight: 120 }}
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
            <View className="mb-2">
              <SegmentedControl
                testID="capsule:create:media"
                value={mediaMode}
                options={[
                  { value: 'video', label: t('capture.mode.video') },
                  { value: 'photo', label: t('capture.mode.photo') },
                ]}
                onChange={setMediaMode}
              />
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
            <AppTextInput
              testID="capsule:create:optional-text"
              value={textBody}
              onChangeText={setTextBody}
              multiline
              placeholder={t('capsule.create.textPlaceholder')}
              style={{ marginTop: 16, minHeight: 72 }}
              textAlignVertical="top"
            />
          </View>
        )}

        <Body className="mb-1 mt-2 text-secondary">{t('capsule.create.unlockDateLabel')}</Body>
        <View className="mb-3">
          <SegmentedControl
            testID="capsule:create:date-presets"
            value={
              daysFromToday(unlockPicked) === 30
                ? '30'
                : daysFromToday(unlockPicked) >= 180 && daysFromToday(unlockPicked) <= 186
                  ? 'sixMonths'
                  : 'custom'
            }
            options={[
              { value: '30', label: t('capsule.create.presets.thirty') },
              { value: 'sixMonths', label: t('capsule.create.presets.sixMonths') },
              { value: 'custom', label: t('capsule.create.presets.custom') },
            ]}
            onChange={(next) => {
              if (next === '30') {
                setUnlockPicked(datePlusDays(30));
              } else if (next === 'sixMonths') {
                setUnlockPicked(datePlusMonths(6));
              } else {
                setShowPicker(true);
              }
            }}
          />
        </View>
        {Platform.OS === 'android' ? (
          <>
            <Pressable
              testID="capsule:create:open-date"
              onPress={() => setShowPicker(true)}
              className="mb-2 rounded-xl border border-borderSubtle bg-surfaceElevated py-3"
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

        <PrimaryButton
          testID="capsule:create:save"
          onPress={() => {
            void onSave();
          }}
          disabled={!saveEnabled || saving}
          accessibilityLabel={t('capsule.create.save')}
          gradient={saveEnabled && !saving}
          variant="orange"
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            t('capsule.create.save')
          )}
        </PrimaryButton>
      </ScrollView>
    </SafeScreen>
  );
}
