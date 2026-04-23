import type { Query } from '@nozbe/watermelondb';
import { Model, Relation } from '@nozbe/watermelondb';
import type { Associations } from '@nozbe/watermelondb/Model';
import { children, date, field, relation, readonly } from '@nozbe/watermelondb/decorators';

import type { AiEnrichment } from './AiEnrichment';
import type { Goal } from './Goal';

export class JournalEntry extends Model {
  static table = 'journal_entries';

  static associations: Associations = {
    goals: { type: 'belongs_to', key: 'goal_id' },
    ai_enrichments: { type: 'has_many', foreignKey: 'journal_entry_id' },
  };

  @field('goal_id') goalId!: string;
  @date('captured_at') capturedAt!: Date;
  @field('mood_tag') moodTag!: string;
  @field('media_path') mediaPath?: string;
  @field('media_type') mediaType?: string;
  @field('text') text?: string;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('goals', 'goal_id') goal!: Relation<Goal>;
  @children('ai_enrichments') aiEnrichments!: Query<AiEnrichment>;
}
