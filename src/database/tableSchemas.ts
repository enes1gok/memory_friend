import { tableSchema } from '@nozbe/watermelondb';

export const goalsTable = tableSchema({
  name: 'goals',
  columns: [
    { name: 'title', type: 'string' },
    { name: 'target_date', type: 'number' },
    { name: 'start_date', type: 'number' },
    { name: 'is_completed', type: 'boolean' },
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' },
  ],
});

export const journalEntriesTable = tableSchema({
  name: 'journal_entries',
  columns: [
    { name: 'goal_id', type: 'string', isIndexed: true },
    { name: 'captured_at', type: 'number' },
    { name: 'mood_tag', type: 'string' },
    { name: 'media_path', type: 'string', isOptional: true },
    { name: 'media_type', type: 'string', isOptional: true },
    { name: 'text', type: 'string', isOptional: true },
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' },
  ],
});

export const streakStateTable = tableSchema({
  name: 'streak_state',
  columns: [
    { name: 'goal_id', type: 'string', isIndexed: true },
    { name: 'current_streak', type: 'number' },
    { name: 'longest_streak', type: 'number' },
    { name: 'last_check_in_date', type: 'string', isOptional: true },
    { name: 'total_entries', type: 'number' },
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' },
  ],
});

export const badgesTable = tableSchema({
  name: 'badges',
  columns: [
    { name: 'goal_id', type: 'string', isIndexed: true },
    { name: 'badge_type', type: 'string' },
    { name: 'awarded_at', type: 'number' },
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' },
  ],
});

export const capsulesTable = tableSchema({
  name: 'capsules',
  columns: [
    { name: 'goal_id', type: 'string', isIndexed: true },
    { name: 'title', type: 'string' },
    { name: 'media_path', type: 'string', isOptional: true },
    { name: 'text', type: 'string', isOptional: true },
    { name: 'unlocks_at', type: 'number' },
    { name: 'is_unlocked', type: 'boolean' },
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' },
  ],
});

export const aiEnrichmentsTable = tableSchema({
  name: 'ai_enrichments',
  columns: [
    { name: 'journal_entry_id', type: 'string', isIndexed: true },
    { name: 'transcription', type: 'string', isOptional: true },
    { name: 'emotion_tags', type: 'string', isOptional: true },
    { name: 'companion_message', type: 'string', isOptional: true },
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' },
  ],
});

/** Canonical table order for schema + migrations (create all at v2). */
export const allTables = [
  goalsTable,
  journalEntriesTable,
  streakStateTable,
  badgesTable,
  capsulesTable,
  aiEnrichmentsTable,
] as const;
