/** FFmpeg assembly, finale export (Cinema Hall). */

export { CollageProgressView } from '@/features/collage/components/CollageProgressView';
export { BUNDLED_MUSIC_MODULES } from '@/features/collage/constants/bundledMusic';
export { useGenerateCollage } from '@/features/collage/hooks/useGenerateCollage';
export type {
  GenerateCollageStatus,
  CollageErrorKind,
} from '@/features/collage/hooks/useGenerateCollage';
export {
  assembleCollage,
  CollageCancelledError,
  type CollageTier,
  type CollageAspectRatio,
  type CollageClipInput,
  type CollagePhase,
  type AssembleCollageOptions,
} from '@/features/collage/logic/assembleCollage';
export { resolveBundledMusicPath } from '@/features/collage/logic/resolveBundledMusicPath';
export {
  selectMusicTrack,
  type MusicTrackId,
} from '@/features/collage/logic/selectMusicTrack';
