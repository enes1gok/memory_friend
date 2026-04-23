import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { schema } from './schema';

let database: Database | null = null;

/** Singleton WatermelonDB instance. Requires a dev build with native SQLite. */
export function getDatabase(): Database {
  if (!database) {
    const adapter = new SQLiteAdapter({
      schema,
      dbName: 'memory_friend',
      jsi: true,
      onSetUpError: (error) => {
        console.error('[memory_friend] WatermelonDB setup error', error);
      },
    });
    database = new Database({
      adapter,
      modelClasses: [],
    });
  }
  return database;
}
