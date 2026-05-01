export const MOOD_OPTIONS = [
  { id: 'happy', emoji: '😊' },
  { id: 'grateful', emoji: '🙏' },
  { id: 'excited', emoji: '🤩' },
  { id: 'calm', emoji: '😌' },
  { id: 'neutral', emoji: '😐' },
  { id: 'tired', emoji: '😴' },
  { id: 'stressed', emoji: '😰' },
  { id: 'sad', emoji: '😢' },
] as const;

export type MoodTagId = (typeof MOOD_OPTIONS)[number]['id'];

/** Inline mood chips on the home quick-add card (full list remains in `MoodPicker` for capture). */
export const QUICK_PICK_MOOD_IDS: readonly MoodTagId[] = ['happy', 'excited', 'calm', 'stressed'];

/** Moods counted as "energetic" in Stats copy (goal-level %). */
export const ENERGETIC_MOOD_TAGS: ReadonlySet<MoodTagId> = new Set(['excited', 'happy']);

export function emojiForMoodTag(tag: string): string {
  const found = MOOD_OPTIONS.find((m) => m.id === tag);
  return found?.emoji ?? '💭';
}
