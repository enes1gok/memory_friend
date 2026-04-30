import { Directory, File, Paths } from 'expo-file-system';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, View } from 'react-native';

import { Body } from '@/components/Typography';
import type { JournalEntry } from '@/models/JournalEntry';
import { toolkitGetThumbnail } from '@/services/mediaToolkit';

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

export function JournalEntryCard({ entry }: JournalEntryCardProps) {
  const { t } = useTranslation();
  const emoji = emojiForMoodTag(entry.moodTag);
  const when = entry.capturedAt.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const uri = mediaUri(entry.mediaPath);
  const isPhoto = entry.mediaType === 'photo';
  const isVideo = entry.mediaType === 'video';

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

  return (
    <View
      testID={`journal:entry:${entry.id}`}
      className="mb-3 flex-row overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80"
    >
      <View className="w-24 items-center justify-center bg-slate-800">
        {isPhoto && uri ? (
          <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
        ) : isVideo && uri ? (
          videoThumbUri ? (
            <Image source={{ uri: videoThumbUri }} className="h-full w-full" resizeMode="cover" />
          ) : videoThumbLoading ? (
            <ActivityIndicator
              color="#f8fafc"
              accessibilityLabel={t('journal.entry.videoThumbLoadingA11y')}
            />
          ) : (
            <Body className="text-2xl">{'🎬'}</Body>
          )
        ) : (
          <Body className="text-2xl">{isVideo ? '🎬' : '📝'}</Body>
        )}
      </View>
      <View className="flex-1 justify-center px-4 py-3">
        <View className="mb-1 flex-row items-center gap-2">
          <Body className="text-2xl">{emoji}</Body>
          <Body className="text-xs uppercase tracking-wide text-slate-500">
            {t(`moods.${entry.moodTag}`, { defaultValue: entry.moodTag })}
          </Body>
        </View>
        <Body className="text-sm text-slate-400">{when}</Body>
        {entry.text ? (
          <Body className="mt-1 text-slate-300" numberOfLines={2}>
            {entry.text}
          </Body>
        ) : null}
      </View>
    </View>
  );
}
