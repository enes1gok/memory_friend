import { Model, Relation } from '@nozbe/watermelondb';
import type { Associations } from '@nozbe/watermelondb/Model';
import { date, field, relation, readonly } from '@nozbe/watermelondb/decorators';

import type { Goal } from './Goal';

export class Badge extends Model {
  static table = 'badges';

  static associations: Associations = {
    goals: { type: 'belongs_to', key: 'goal_id' },
  };

  @field('goal_id') goalId!: string;
  @field('badge_type') badgeType!: string;
  @date('awarded_at') awardedAt!: Date;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @relation('goals', 'goal_id') goal!: Relation<Goal>;
}
