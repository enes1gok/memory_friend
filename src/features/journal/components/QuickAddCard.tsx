import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { AnimatedPressable } from '@/components/AnimatedPressable';
import { AppTextInput } from '@/components/AppTextInput';
import { GradientCard } from '@/components/GradientCard';
import { Caption } from '@/components/Typography';
import { useEnrichJournalEntry } from '@/features/ai/hooks/useEnrichJournalEntry';
import {
  MOOD_OPTIONS,
  QUICK_PICK_MOOD_IDS,
  type MoodTagId,
} from '@/features/journal/constants/moods';
import { useSaveJournalEntry } from '@/features/journal/hooks/useSaveJournalEntry';
import { CelebrationOverlay } from '@/features/streak/components/CelebrationOverlay';
import type { BadgeTypeId } from '@/features/streak/constants/badgeTypes';
import { pickBestNewBadge } from '@/features/streak/logic/pickBestNewBadge';
import { useUIStore } from '@/stores/useUIStore';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/radius';
import { hapticSuccess } from '@/utils/haptics';
import { persistJournalMedia } from '@/utils/persistJournalMedia';

const SAVED_FEEDBACK_MS = 2200;

/** Floating save + mic */
const FAB_SIZE = 56;
const FAB_INSET = 12;
const FAB_GAP = 12;
/** Horizontal space used by both FABs + outer inset (from card inner edge). */
const FAB_CLUSTER_WIDTH = FAB_INSET + FAB_SIZE + FAB_GAP + FAB_SIZE + FAB_INSET;

/** Mood emoji row sits above the FAB cluster */
const MOOD_ROW_BOTTOM_OFFSET = FAB_INSET + FAB_SIZE + 10;

const MOOD_ROW_HEIGHT = 44;
const CONTENT_PAD_BELOW_FABS =
  FAB_INSET + FAB_SIZE + 10 + MOOD_ROW_HEIGHT + FAB_INSET;

const styles = StyleSheet.create({
  layerRelative: {
    position: 'relative',
    minHeight: 1,
  },
  moodRow: {
    position: 'absolute',
    left: 8,
    right: FAB_CLUSTER_WIDTH + 8,
    bottom: MOOD_ROW_BOTTOM_OFFSET,
    height: MOOD_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 4,
  },
  fabMic: {
    position: 'absolute',
    width: FAB_SIZE,
    height: FAB_SIZE,
    bottom: FAB_INSET,
    right: FAB_INSET + FAB_SIZE + FAB_GAP,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: FAB_SIZE / 2,
    zIndex: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  fabSave: {
    position: 'absolute',
    width: FAB_SIZE,
    height: FAB_SIZE,
    bottom: FAB_INSET,
    right: FAB_INSET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: FAB_SIZE / 2,
    zIndex: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
});

export type QuickAddCardProps = {
  accentColor: string;
};

function moodEmoji(id: MoodTagId): string {
  return MOOD_OPTIONS.find((m) => m.id === id)?.emoji ?? '💭';
}

export function QuickAddCard({ accentColor }: QuickAddCardProps) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [attachedPath, setAttachedPath] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodTagId>('happy');
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [celebrationBadge, setCelebrationBadge] = useState<BadgeTypeId | null>(null);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveJournalEntry = useSaveJournalEntry();
  const { triggerEnrichment } = useEnrichJournalEntry();
  const setHypeManFromCapturePending = useUIStore((s) => s.setHypeManFromCapturePending);

  const canSubmit = text.trim().length > 0 || attachedPath != null;

  useEffect(() => {
    return () => {
      if (savedTimerRef.current != null) {
        clearTimeout(savedTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      const rec = recordingRef.current;
      if (rec != null) {
        void rec.stopAndUnloadAsync().catch(() => undefined);
        recordingRef.current = null;
      }
    };
  }, []);

  const pickImage = useCallback(async () => {
    if (saving || isRecording) {
      return;
    }
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: false,
    });
    if (result.canceled || result.assets[0] == null) {
      return;
    }
    const uri = result.assets[0].uri;
    try {
      const persisted = persistJournalMedia(uri, 'jpg');
      setAttachedPath(persisted);
    } catch (e) {
      console.error('[QuickAddCard] persist picked image failed', e);
    }
  }, [isRecording, saving]);

  const clearAttachment = useCallback(() => {
    setAttachedPath(null);
  }, []);

  const runCelebration = useCallback(
    (newBadges: BadgeTypeId[]) => {
      setShowSaved(true);
      if (savedTimerRef.current != null) {
        clearTimeout(savedTimerRef.current);
      }
      savedTimerRef.current = setTimeout(() => {
        setShowSaved(false);
        savedTimerRef.current = null;
      }, SAVED_FEEDBACK_MS);

      const best = pickBestNewBadge(newBadges);
      if (best) {
        hapticSuccess();
        setCelebrationBadge(best);
        setCelebrationOpen(true);
      }
    },
    [],
  );

  const performSave = useCallback(async () => {
    const trimmed = text.trim();
    const mediaPath = attachedPath;
    if (trimmed.length === 0 && mediaPath == null) {
      return;
    }
    setSaving(true);
    try {
      const { newBadges } = await saveJournalEntry({
        moodTag: selectedMood,
        ...(trimmed.length > 0 ? { text: trimmed } : {}),
        ...(mediaPath != null ? { mediaPath, mediaType: 'photo' } : {}),
      });
      setText('');
      setAttachedPath(null);
      runCelebration(newBadges);
    } catch (e) {
      console.error('[QuickAddCard] save journal entry failed', e);
    } finally {
      setSaving(false);
    }
  }, [attachedPath, runCelebration, saveJournalEntry, selectedMood, text]);

  const stopRecordingAndSave = useCallback(async () => {
    const rec = recordingRef.current;
    if (rec == null) {
      return;
    }
    recordingRef.current = null;
    setIsRecording(false);
    setSaving(true);
    try {
      const status = await rec.stopAndUnloadAsync();
      const durationMs =
        typeof status.durationMillis === 'number' ? status.durationMillis : 0;
      if (durationMs < 400) {
        return;
      }
      const uri = rec.getURI();
      if (uri == null || uri.length === 0) {
        return;
      }
      const persisted = persistJournalMedia(uri, 'm4a');
      const trimmed = text.trim();
      const { entryId, newBadges } = await saveJournalEntry({
        moodTag: selectedMood,
        mediaPath: persisted,
        mediaType: 'audio',
        ...(trimmed.length > 0 ? { text: trimmed } : {}),
      });
      triggerEnrichment({ entryId, mediaPath: persisted, mediaType: 'audio' });
      setText('');
      setAttachedPath(null);
      runCelebration(newBadges);
    } catch (e) {
      console.error('[QuickAddCard] voice note save failed', e);
    } finally {
      setSaving(false);
    }
  }, [runCelebration, saveJournalEntry, selectedMood, text, triggerEnrichment]);

  const startRecording = useCallback(async () => {
    if (saving) {
      return;
    }
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (e) {
      console.error('[QuickAddCard] start recording failed', e);
      setIsRecording(false);
      recordingRef.current = null;
    }
  }, [saving]);

  const onMicPress = useCallback(() => {
    if (saving) {
      return;
    }
    if (isRecording) {
      void stopRecordingAndSave();
    } else {
      void startRecording();
    }
  }, [isRecording, saving, startRecording, stopRecordingAndSave]);

  const inputLocked = saving;

  const cardGradientColors = useMemo(
    () => [`${accentColor}4D`, `${accentColor}24`] as [string, string],
    [accentColor],
  );

  const saveDisabled = !canSubmit || saving || isRecording;

  return (
    <View>
      <GradientCard
        testID="home:quick-add:card"
        accessibilityRole="none"
        colors={cardGradientColors}
        style={{ borderRadius: radius['3xl'] }}
        contentStyle={{ padding: 16 }}
      >
        <View style={styles.layerRelative}>
          <View
            style={{
              paddingBottom: CONTENT_PAD_BELOW_FABS + (showSaved ? 28 : 0),
            }}
          >
            <AppTextInput
              testID="home:quick-add:input"
              accessibilityLabel={t('home.quickAdd.a11yInput')}
              placeholder={t('home.quickAdd.placeholder')}
              value={text}
              onChangeText={setText}
              multiline
              textAlignVertical="top"
              editable={!inputLocked && !isRecording}
              style={{ minHeight: 112, maxHeight: 160 }}
              maxLength={2000}
            />

            <View className="mt-2 flex-row flex-wrap items-center gap-2">
              <AnimatedPressable
                testID="home:quick-add:attach"
                haptic
                accessibilityRole="button"
                accessibilityLabel={t('home.quickAdd.attachA11y')}
                disabled={inputLocked || isRecording}
                onPress={() => {
                  void pickImage();
                }}
                className="flex-row items-center gap-2 rounded-2xl border border-outline bg-surfaceContainerHigh px-3 py-2.5"
              >
                <Ionicons name="attach-outline" size={22} color={colors.onSurfaceVariant} />
                <Caption className="text-sm text-secondary">{t('home.quickAdd.attachLabel')}</Caption>
              </AnimatedPressable>

              {attachedPath != null ? (
                <View className="flex-row items-center gap-2">
                  <Image
                    accessibilityIgnoresInvertColors
                    source={{ uri: attachedPath }}
                    className="rounded-xl bg-surfaceContainerHigh"
                    style={{ width: 52, height: 52 }}
                  />
                  <AnimatedPressable
                    testID="home:quick-add:remove-attachment"
                    haptic
                    accessibilityRole="button"
                    accessibilityLabel={t('home.quickAdd.removeAttachmentA11y')}
                    disabled={inputLocked || isRecording}
                    onPress={clearAttachment}
                    className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
                  >
                    <Ionicons name="close-circle" size={24} color={colors.textMuted} />
                  </AnimatedPressable>
                </View>
              ) : null}
            </View>

            {showSaved ? (
              <Caption
                className="mt-2 pr-14 text-center text-secondary"
                accessibilityLiveRegion="polite"
              >
                {t('home.quickAdd.saved')}
              </Caption>
            ) : null}
          </View>

          <View style={styles.moodRow} pointerEvents="box-none">
            {QUICK_PICK_MOOD_IDS.map((id) => {
              const selected = selectedMood === id;
              return (
                <AnimatedPressable
                  key={id}
                  testID={`home:quick-add:mood:${id}`}
                  haptic
                  accessibilityRole="button"
                  accessibilityLabel={t(`moods.${id}`)}
                  accessibilityState={{ selected }}
                  disabled={inputLocked || isRecording}
                  onPress={() => {
                    setSelectedMood(id);
                  }}
                  className="h-11 w-11 items-center justify-center rounded-2xl border"
                  style={{
                    borderColor: selected ? accentColor : colors.outline,
                    backgroundColor: selected ? `${accentColor}33` : colors.surfaceContainerHigh,
                  }}
                >
                  <Text className="text-2xl">{moodEmoji(id)}</Text>
                </AnimatedPressable>
              );
            })}
          </View>

          <AnimatedPressable
            testID="home:quick-add:mic"
            haptic
            accessibilityRole="button"
            accessibilityLabel={
              isRecording ? t('home.quickAdd.micStopA11y') : t('home.quickAdd.micRecordA11y')
            }
            accessibilityState={{ busy: saving }}
            disabled={saving}
            onPress={onMicPress}
            style={[
              styles.fabMic,
              {
                backgroundColor: isRecording ? colors.error : colors.surfaceContainerHighest,
                borderWidth: 1,
                borderColor: colors.outline,
              },
            ]}
          >
            <Ionicons
              name={isRecording ? 'stop' : 'mic'}
              size={26}
              color={isRecording ? colors.onError : colors.onSurface}
            />
          </AnimatedPressable>

          <AnimatedPressable
            testID="home:quick-add:save"
            haptic
            accessibilityRole="button"
            accessibilityLabel={t('home.quickAdd.saveCta')}
            accessibilityState={{ disabled: saveDisabled }}
            disabled={saveDisabled}
            onPress={() => {
              void performSave();
            }}
            style={[styles.fabSave, { backgroundColor: accentColor }]}
          >
            {saving && !isRecording ? (
              <ActivityIndicator color={colors.onPrimary} size="small" />
            ) : (
              <Ionicons name="paper-plane" size={24} color={colors.onPrimary} />
            )}
          </AnimatedPressable>
        </View>
      </GradientCard>

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
