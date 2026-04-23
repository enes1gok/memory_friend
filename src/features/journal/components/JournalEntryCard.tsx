import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';

import { Body } from '@/components/Typography';
import type { JournalEntry } from '@/models/JournalEntry';

import { emojiForMoodTag } from '../constants/moods';

export type JournalEntryCardProps = {
  entry: JournalEntry;
};

function mediaUri(path?: string): string | undefined {
  if (!path) return undefined;
  return path.startsWith('file://') ? path : `file://${path}`;
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

  return (
    <View
      testID={`journal:entry:${entry.id}`}
      className="mb-3 flex-row overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80"
    >
      <View className="w-24 items-center justify-center bg-slate-800">
        {isPhoto && uri ? (
          <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
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
