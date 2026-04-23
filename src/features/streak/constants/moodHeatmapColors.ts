import type { MoodTagId } from '@/features/journal/constants/moods';

/** GitHub-style cell colors per mood (readable on dark background). */
export const MOOD_HEATMAP_COLORS: Record<MoodTagId, string> = {
  happy: '#22c55e',
  grateful: '#a855f7',
  excited: '#f97316',
  calm: '#3b82f6',
  neutral: '#64748b',
  tired: '#94a3b8',
  stressed: '#eab308',
  sad: '#6366f1',
};

export function heatmapColorForMoodTag(tag: string): string {
  if (tag in MOOD_HEATMAP_COLORS) {
    return MOOD_HEATMAP_COLORS[tag as MoodTagId];
  }
  return '#475569';
}
