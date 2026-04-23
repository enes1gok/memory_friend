import { createTable, schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

import { allTables } from '../tableSchemas';

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: allTables.map((table) =>
        createTable({
          name: table.name,
          columns: table.columnArray,
          unsafeSql: table.unsafeSql,
        }),
      ),
    },
  ],
});
