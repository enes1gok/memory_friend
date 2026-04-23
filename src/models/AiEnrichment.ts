import { Model, Relation } from '@nozbe/watermelondb';
import type { Associations } from '@nozbe/watermelondb/Model';
import { field, relation, readonly, date } from '@nozbe/watermelondb/decorators';

import type { JournalEntry } from './JournalEntry';

const TAG_SEPARATOR = '|';

export class AiEnrichment extends Model {
  static table = 'ai_enrichments';

  static associations: Associations = {
    journal_entries: { type: 'belongs_to', key: 'journal_entry_id' },
  };

  @field('journal_entry_id') journalEntryId!: string;
  @field('transcription') transcription?: string;
  @field('emotion_tags') emotionTagsRaw?: string;
  @field('companion_message') companionMessage?: string;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('journal_entries', 'journal_entry_id') journalEntry!: Relation<JournalEntry>;

  /** Pipe-delimited `emotion_tags` column decoded for UI. */
  get emotionTags(): string[] {
    const raw = this.emotionTagsRaw;
    if (!raw?.length) {
      return [];
    }
    return raw.split(TAG_SEPARATOR).filter(Boolean);
  }
}
