import { appSchema } from '@nozbe/watermelondb';

import { allTables } from './tableSchemas';

export const schema = appSchema({
  version: 2,
  tables: [...allTables],
});
