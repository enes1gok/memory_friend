import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Directory, File, Paths } from 'expo-file-system';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { Image, Platform, View } from 'react-native';
import Animated, { Layout } from 'react-native-reanimated';

import { AnimatedPressable } from '@/components/AnimatedPressable';
import { IconChip } from '@/components/IconChip';
import { Skeleton } from '@/components/Skeleton';
import { Body, Caption } from '@/components/Typography';
import { useJournalEntryTranscript } from '@/features/journal/hooks/useJournalEntryTranscript';
import type { JournalEntry } from '@/models/JournalEntry';
import { toolkitGetThumbnail } from '@/services/mediaToolkit';
import { colors } from '@/theme/colors';
import { springs } from '@/theme/motion';

import { emojiForMoodTag } from '../constants/moods';

export type JournalEntryCardProps = {
  entry: JournalEntry;
};

function mediaUri(path?: string): string | undefined {
  if (!path) return undefined;
  return path.startsWith('file://') ? path : `file://${path}`;
}

function stripFileScheme(uri: string): string {
  if (uri.startsWith('file://')) {
    return decodeURI(uri.replace(/^file:\/\//, ''));
  }
  return uri;
}

function VoiceNotePlayer({ uri }: { uri: string }) {
  const { t } = useTranslation();
  const [playing, setPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      void soundRef.current?.unloadAsync();
      soundRef.current = null;
    };
  }, [uri]);

  const toggle = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
      if (soundRef.current != null) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            await soundRef.current.pauseAsync();
            setPlaying(false);
            return;
          }
          await soundRef.current.playAsync();
          setPlaying(true);
          return;
        }
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (playbackStatus) => {
          if (
            playbackStatus.isLoaded &&
            !playbackStatus.isPlaying &&
            playbackStatus.didJustFinish
          ) {
            setPlaying(false);
          }
        },
      );
      soundRef.current = sound;
      setPlaying(true);
    } catch (e) {
      console.warn('[VoiceNotePlayer] playback failed', e);
    }
  };

  return (
    <AnimatedPressable
      testID="journal:entry:voice-play"
      haptic
      accessibilityRole="button"
      accessibilityLabel={playing ? t('journal.entry.pauseVoiceA11y') : t('journal.entry.playVoiceA11y')}
      onPress={() => {
        void toggle();
      }}
      className="mt-2 flex-row items-center gap-2 self-start rounded-full border border-outline bg-surfaceContainerHigh px-3 py-2"
    >
      <Ionicons name={playing ? 'pause' : 'play'} size={18} color={colors.accentBlue} />
      <Caption className="text-xs font-semibold text-accentBlue">{t('journal.entry.voiceNote')}</Caption>
    </AnimatedPressable>
  );
}

export function JournalEntryCard({ entry }: JournalEntryCardProps) {
  const { t } = useTranslation();
  const emoji = emojiForMoodTag(entry.moodTag);
  const transcript = useJournalEntryTranscript(entry.id);
  const when = entry.capturedAt.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const uri = mediaUri(entry.mediaPath);
  const isPhoto = entry.mediaType === 'photo';
  const isVideo = entry.mediaType === 'video';
  const isAudio = entry.mediaType === 'audio';

  const [videoThumbUri, setVideoThumbUri] = useState<string | null>(null);
  const [videoThumbLoading, setVideoThumbLoading] = useState(false);

  useEffect(() => {
    if (!isVideo || !uri || Platform.OS === 'web') {
      setVideoThumbUri(null);
      setVideoThumbLoading(false);
      return;
    }

    let cancelled = false;
    setVideoThumbLoading(true);
    setVideoThumbUri(null);

    void (async () => {
      try {
        const safeId = entry.id.replace(/[^a-zA-Z0-9_-]/g, '_');
        const dir = new Directory(Paths.cache, 'journal_thumbs');
        dir.create({ intermediates: true, idempotent: true });
        const thumbFile = new File(dir, `${safeId}.jpg`);
        const outputPath = stripFileScheme(thumbFile.uri);

        const result = await toolkitGetThumbnail(uri, {
          timeMs: 0,
          maxWidth: 192,
          quality: 78,
          outputPath,
        });

        if (!cancelled) {
          setVideoThumbUri(result.uri);
        }
      } catch {
        if (!cancelled) {
          setVideoThumbUri(null);
        }
      } finally {
        if (!cancelled) {
          setVideoThumbLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [entry.id, isVideo, uri]);

  const thumbLabel = isAudio ? '🎙️' : isVideo ? '🎬' : '📝';

  return (
    <Animated.View
      testID={`journal:entry:${entry.id}`}
      layout={Layout.springify().damping(springs.gentle.damping)}
      className="mb-md flex-row overflow-hidden rounded-xl border border-outline bg-surfaceContainer"
    >
      <View
        className="w-24 items-center justify-center bg-surfaceContainerHigh"
        accessibilityLabel={
          isAudio ? t('journal.entry.voiceThumbA11y') : undefined
        }
      >
        {isPhoto && uri ? (
          <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
        ) : isVideo && uri ? (
          videoThumbUri ? (
            <Image source={{ uri: videoThumbUri }} className="h-full w-full" resizeMode="cover" />
          ) : videoThumbLoading ? (
            <Skeleton variant="block" width="100%" height="100%" />
          ) : (
            <Body className="text-2xl">{'🎬'}</Body>
          )
        ) : (
          <Body className="text-2xl">{thumbLabel}</Body>
        )}
      </View>
      <View className="flex-1 justify-center px-4 py-3">
        <View className="mb-1 flex-row items-center gap-2">
          <IconChip emoji={emoji} label={t(`moods.${entry.moodTag}`, { defaultValue: entry.moodTag })} />
        </View>
        <Body className="text-sm text-muted">{when}</Body>
        {entry.text ? (
          <Body className="mt-1 text-secondary" numberOfLines={4}>
            {entry.text}
          </Body>
        ) : null}
        {isAudio && uri ? <VoiceNotePlayer uri={uri} /> : null}
        {transcript ? (
          <View className="mt-2">
            <Caption className="mb-0.5 text-[10px] uppercase tracking-wide text-muted">
              {t('journal.entry.transcribedLabel')}
            </Caption>
            <Body className="text-sm text-secondary" numberOfLines={6}>
              {transcript}
            </Body>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}
