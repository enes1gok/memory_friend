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

export function emojiForMoodTag(tag: string): string {
  const found = MOOD_OPTIONS.find((m) => m.id === tag);
  return found?.emoji ?? '💭';
}
