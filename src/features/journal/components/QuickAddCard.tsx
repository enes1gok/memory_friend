import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';

import { AnimatedPressable } from '@/components/AnimatedPressable';
import { AppTextInput } from '@/components/AppTextInput';
import { GradientCard } from '@/components/GradientCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Caption } from '@/components/Typography';
import { MoodPicker } from '@/features/journal/components/MoodPicker';
import { useSaveJournalEntry } from '@/features/journal/hooks/useSaveJournalEntry';
import { CelebrationOverlay } from '@/features/streak/components/CelebrationOverlay';
import type { BadgeTypeId } from '@/features/streak/constants/badgeTypes';
import { pickBestNewBadge } from '@/features/streak/logic/pickBestNewBadge';
import { useUIStore } from '@/stores/useUIStore';
import { colors } from '@/theme/colors';
import { hapticSuccess } from '@/utils/haptics';
import { persistJournalMedia } from '@/utils/persistJournalMedia';

const SAVED_FEEDBACK_MS = 2200;

export type QuickAddCardProps = {
  accentColor: string;
};

export function QuickAddCard({ accentColor }: QuickAddCardProps) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [attachedPath, setAttachedPath] = useState<string | null>(null);
  const [moodSheetOpen, setMoodSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [celebrationBadge, setCelebrationBadge] = useState<BadgeTypeId | null>(null);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const pendingNoteRef = useRef('');
  const pendingMediaRef = useRef<{ path: string } | null>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveJournalEntry = useSaveJournalEntry();
  const setHypeManFromCapturePending = useUIStore((s) => s.setHypeManFromCapturePending);

  const canSubmit =
    text.trim().length > 0 || attachedPath != null;

  useEffect(() => {
    return () => {
      if (savedTimerRef.current != null) {
        clearTimeout(savedTimerRef.current);
      }
    };
  }, []);

  const pickImage = useCallback(async () => {
    if (saving || moodSheetOpen) {
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
  }, [moodSheetOpen, saving]);

  const clearAttachment = useCallback(() => {
    setAttachedPath(null);
  }, []);

  const openMoodPicker = useCallback(() => {
    const trimmed = text.trim();
    const mediaPath = attachedPath;
    if (trimmed.length === 0 && mediaPath == null) {
      return;
    }
    pendingNoteRef.current = trimmed;
    pendingMediaRef.current = mediaPath != null ? { path: mediaPath } : null;
    setMoodSheetOpen(true);
  }, [attachedPath, text]);

  const onMoodPick = useCallback(
    async (moodTag: string) => {
      const note = pendingNoteRef.current;
      const media = pendingMediaRef.current;
      if (note.length === 0 && media == null) {
        setMoodSheetOpen(false);
        return;
      }
      setSaving(true);
      setMoodSheetOpen(false);
      try {
        const { newBadges } = await saveJournalEntry({
          moodTag,
          ...(note.length > 0 ? { text: note } : {}),
          ...(media != null ? { mediaPath: media.path, mediaType: 'photo' } : {}),
        });
        setText('');
        setAttachedPath(null);
        pendingNoteRef.current = '';
        pendingMediaRef.current = null;
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
      } catch (e) {
        console.error('[QuickAddCard] save journal entry failed', e);
      } finally {
        setSaving(false);
      }
    },
    [saveJournalEntry],
  );

  const dismissMoodSheet = useCallback(() => {
    if (!saving) {
      setMoodSheetOpen(false);
    }
  }, [saving]);

  const inputLocked = saving || moodSheetOpen;

  return (
    <View>
      <GradientCard
        testID="home:quick-add:card"
        accessibilityRole="none"
        colors={[`${accentColor}2A`, 'rgba(255,255,255,0.03)', colors.surfaceContainer]}
        contentStyle={{ padding: 16 }}
      >
        <AppTextInput
          testID="home:quick-add:input"
          accessibilityLabel={t('home.quickAdd.a11yInput')}
          placeholder={t('home.quickAdd.placeholder')}
          value={text}
          onChangeText={setText}
          multiline
          textAlignVertical="top"
          editable={!inputLocked}
          style={{ minHeight: 112, maxHeight: 160 }}
          maxLength={2000}
        />

        <View className="mt-2 flex-row flex-wrap items-center gap-2">
          <AnimatedPressable
            testID="home:quick-add:attach"
            haptic
            accessibilityRole="button"
            accessibilityLabel={t('home.quickAdd.attachA11y')}
            disabled={inputLocked}
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
                disabled={inputLocked}
                onPress={clearAttachment}
                className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
              >
                <Ionicons name="close-circle" size={24} color={colors.textMuted} />
              </AnimatedPressable>
            </View>
          ) : null}
        </View>

        <PrimaryButton
          testID="home:quick-add:save"
          variant="accent"
          gradient
          className="mt-3"
          disabled={!canSubmit || saving || moodSheetOpen}
          loading={saving}
          onPress={openMoodPicker}
          accessibilityLabel={t('home.quickAdd.saveCta')}
        >
          {t('home.quickAdd.saveCta')}
        </PrimaryButton>

        {showSaved ? (
          <Caption className="mt-2 text-center text-secondary" accessibilityLiveRegion="polite">
            {t('home.quickAdd.saved')}
          </Caption>
        ) : null}
      </GradientCard>

      <MoodPicker visible={moodSheetOpen} onPick={onMoodPick} onDismiss={dismissMoodSheet} />

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
