import type { MusicTrackId } from '@/features/collage/logic/selectMusicTrack';

export const BUNDLED_MUSIC_MODULES: Record<MusicTrackId, number> = {
  calm: require('../../../../assets/audio/calm.mp3'),
  building: require('../../../../assets/audio/building.mp3'),
  energetic: require('../../../../assets/audio/energetic.mp3'),
};
