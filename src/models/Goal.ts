import type { Query } from '@nozbe/watermelondb';
import { Model } from '@nozbe/watermelondb';
import type { Associations } from '@nozbe/watermelondb/Model';
import { children, date, field, readonly } from '@nozbe/watermelondb/decorators';

import type { Badge } from './Badge';
import type { Capsule } from './Capsule';
import type { JournalEntry } from './JournalEntry';
import type { StreakState } from './StreakState';

export class Goal extends Model {
  static table = 'goals';

  static associations: Associations = {
    journal_entries: { type: 'has_many', foreignKey: 'goal_id' },
    streak_state: { type: 'has_many', foreignKey: 'goal_id' },
    badges: { type: 'has_many', foreignKey: 'goal_id' },
    capsules: { type: 'has_many', foreignKey: 'goal_id' },
  };

  @field('title') title!: string;
  @date('target_date') targetDate!: Date;
  @date('start_date') startDate!: Date;
  @field('is_completed') isCompleted!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('journal_entries') journalEntries!: Query<JournalEntry>;
  @children('streak_state') streakStates!: Query<StreakState>;
  @children('badges') badges!: Query<Badge>;
  @children('capsules') capsules!: Query<Capsule>;
}
