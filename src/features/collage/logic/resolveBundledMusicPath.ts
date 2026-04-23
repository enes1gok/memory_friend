import { Asset } from 'expo-asset';

import { BUNDLED_MUSIC_MODULES } from '@/features/collage/constants/bundledMusic';
import type { MusicTrackId } from '@/features/collage/logic/selectMusicTrack';

/** Resolves a Metro-bundled MP3 to a local file URI for FFmpeg. */
export async function resolveBundledMusicPath(trackId: MusicTrackId): Promise<string> {
  const mod = BUNDLED_MUSIC_MODULES[trackId];
  const asset = Asset.fromModule(mod);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  if (!uri) {
    throw new Error(`Could not resolve bundled music asset: ${trackId}`);
  }
  return uri;
}
