import { ALLOWED_EMOTION_TAGS } from '@/features/ai/logic/tagEmotions';

const CALM = new Set(['calm', 'exhausted', 'sad']);
const BUILDING = new Set(['stressed', 'anxious']);
const ENERGETIC = new Set(['motivated', 'happy', 'proud']);

export type MusicTrackId = 'calm' | 'building' | 'energetic';

const ALLOWED = new Set<string>(ALLOWED_EMOTION_TAGS);

/**
 * Picks a bundled track from emotion tag rows (pipe-delimited DB strings). Free tier: always null.
 */
export function selectMusicTrack(
  emotionTagRows: (string | undefined | null)[],
  isPro: boolean,
): MusicTrackId | null {
  if (!isPro) {
    return null;
  }

  let calmScore = 0;
  let buildingScore = 0;
  let energeticScore = 0;

  for (const row of emotionTagRows) {
    if (!row?.length) continue;
    for (const raw of row.split('|')) {
      const tag = raw.trim().toLowerCase();
      if (!ALLOWED.has(tag)) continue;
      if (CALM.has(tag)) calmScore += 1;
      if (BUILDING.has(tag)) buildingScore += 1;
      if (ENERGETIC.has(tag)) energeticScore += 1;
    }
  }

  if (calmScore === 0 && buildingScore === 0 && energeticScore === 0) {
    return 'building';
  }

  const max = Math.max(calmScore, buildingScore, energeticScore);
  if (energeticScore === max) return 'energetic';
  if (buildingScore === max) return 'building';
  return 'calm';
}
