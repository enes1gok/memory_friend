import { Model, Relation } from '@nozbe/watermelondb';
import type { Associations } from '@nozbe/watermelondb/Model';
import { field, relation, readonly, date } from '@nozbe/watermelondb/decorators';

import type { Goal } from './Goal';

export class StreakState extends Model {
  static table = 'streak_state';

  static associations: Associations = {
    goals: { type: 'belongs_to', key: 'goal_id' },
  };

  @field('goal_id') goalId!: string;
  @field('current_streak') currentStreak!: number;
  @field('longest_streak') longestStreak!: number;
  @field('last_check_in_date') lastCheckInDate?: string;
  @field('total_entries') totalEntries!: number;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('goals', 'goal_id') goal!: Relation<Goal>;
}
