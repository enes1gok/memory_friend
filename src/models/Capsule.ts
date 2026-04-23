import { Model, Relation } from '@nozbe/watermelondb';
import type { Associations } from '@nozbe/watermelondb/Model';
import { date, field, relation, readonly } from '@nozbe/watermelondb/decorators';

import type { Goal } from './Goal';

export class Capsule extends Model {
  static table = 'capsules';

  static associations: Associations = {
    goals: { type: 'belongs_to', key: 'goal_id' },
  };

  @field('goal_id') goalId!: string;
  @field('title') title!: string;
  @field('media_path') mediaPath?: string;
  @field('text') text?: string;
  @date('unlocks_at') unlocksAt!: Date;
  @field('is_unlocked') isUnlocked!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('goals', 'goal_id') goal!: Relation<Goal>;
}
