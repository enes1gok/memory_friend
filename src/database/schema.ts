import { appSchema } from '@nozbe/watermelondb';

/** Version 1: no tables yet. Add tables + migrations in Phase 2. */
export const schema = appSchema({
  version: 1,
  tables: [],
});
