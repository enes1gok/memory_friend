import { Q } from '@nozbe/watermelondb';
import { useDatabase } from '@nozbe/watermelondb/react';
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import { File } from 'expo-file-system';
import { useCallback, useState } from 'react';

import { isProUser } from '@/features/subscription';
import type { JournalEntry } from '@/models/JournalEntry';
import { storage } from '@/utils/mmkv';
import { MMKV_KEYS } from '@/utils/mmkvKeys';

import {
  assembleCollage,
  CollageCancelledError,
  type CollageClipInput,
} from '@/features/collage/logic/assembleCollage';
import { resolveBundledMusicPath } from '@/features/collage/logic/resolveBundledMusicPath';
import { selectMusicTrack } from '@/features/collage/logic/selectMusicTrack';

export type GenerateCollageStatus = 'idle' | 'generating' | 'done' | 'error';

export type CollageErrorKind = 'noMedia' | 'assembly' | 'cancelled';

export function useGenerateCollage(goalId: string | undefined | null) {
  const database = useDatabase();
  const [status, setStatus] = useState<GenerateCollageStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [outputPath, setOutputPath] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<CollageErrorKind | null>(null);

  const loadFromCache = useCallback((): boolean => {
    if (!goalId) {
      return false;
    }
    const cachedGoal = storage.getString(MMKV_KEYS.collageGeneratedForGoalId);
    const cachedPath = storage.getString(MMKV_KEYS.collageExportPath);
    if (cachedGoal !== goalId || !cachedPath?.length) {
      return false;
    }
    const f = new File(cachedPath);
    if (!f.exists) {
      return false;
    }
    setOutputPath(cachedPath);
    setStatus('done');
    setProgress(1);
    setErrorKind(null);
    return true;
  }, [goalId]);

  const cancel = useCallback(() => {
    void FFmpegKit.cancel();
  }, []);

  const generate = useCallback(async () => {
    if (!goalId) {
      return;
    }

    setStatus('generating');
    setProgress(0.05);
    setErrorKind(null);
    setOutputPath(null);

    try {
      const entries = await database
        .get<JournalEntry>('journal_entries')
        .query(Q.where('goal_id', goalId), Q.sortBy('captured_at', Q.asc))
        .fetch();

      const clips: CollageClipInput[] = [];
      const emotionRows: (string | undefined)[] = [];

      for (const e of entries) {
        if (e.mediaPath?.length) {
          clips.push({
            path: e.mediaPath,
            mediaType: e.mediaType ?? 'video',
          });
        }
        const enrichments = await e.aiEnrichments.fetch();
        for (const row of enrichments) {
          emotionRows.push(row.emotionTagsRaw);
        }
      }

      if (clips.length === 0) {
        setStatus('error');
        setErrorKind('noMedia');
        setProgress(0);
        return;
      }

      const pro = isProUser();
      const tier = pro ? 'pro' : 'free';
      const trackId = selectMusicTrack(emotionRows, pro);
      const musicPath = trackId ? await resolveBundledMusicPath(trackId) : null;

      setProgress(0.1);

      const out = await assembleCollage(clips, tier, musicPath, {
        aspectRatio: '16:9',
        onPhase: (phase) => {
          if (phase === 'trimming') {
            setProgress(0.25);
          } else if (phase === 'merging') {
            setProgress(0.55);
          } else {
            setProgress(0.8);
          }
        },
      });

      storage.set(MMKV_KEYS.collageGeneratedForGoalId, goalId);
      storage.set(MMKV_KEYS.collageExportPath, out);

      setOutputPath(out);
      setStatus('done');
      setProgress(1);
    } catch (err) {
      if (err instanceof CollageCancelledError) {
        setStatus('error');
        setErrorKind('cancelled');
        setProgress(0);
        return;
      }
      console.error('[useGenerateCollage]', err);
      setStatus('error');
      setErrorKind('assembly');
      setProgress(0);
    }
  }, [database, goalId]);

  return {
    status,
    progress,
    outputPath,
    errorKind,
    loadFromCache,
    generate,
    cancel,
  };
}
