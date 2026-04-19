---
name: add-watermelondb-model
description: Adds or changes a WatermelonDB model, schema table, and migration for memory_friend. Use when introducing a new entity, column, or relation.
---

# Add WatermelonDB model

## Read first

- [.cursor/rules/data-layer.mdc](../rules/data-layer.mdc) — source of truth, no blobs in rows.
- [@nozbe/watermelondb docs](https://watermelondb.dev/) — Model, Schema, Migrations.

## Steps

### 1. Model class

Create `src/models/{Entity}.ts` (or project convention):

- Extend `Model` from `@nozbe/watermelondb`.
- Use `@table` name matching schema table name.
- Decorate columns: `@field`, `@date`, `@readonly`, `@relation`, `@children` as needed.
- **Never** store binary media — store `uri` / relative path strings only.

### 2. Schema

In `src/database/schema.ts` (or equivalent):

- Add `tableSchema({ name, columns: [...] })`.
- Bump **schema version** number used by migrations.

### 3. Migration

In `src/database/migrations/`:

- Add `schemaMigrations` step: `createTable` for new tables, or `addColumns` / safe transforms for changes.
- **Never** edit old migration files that shipped — append new versions only.

### 4. Register model

In database setup (`src/database/index.ts` or similar):

- Add model class to `modelClasses` / `Database` constructor per WatermelonDB setup.

### 5. Query / UI

- Use `Q` filters for queries.
- For reactive UI, prefer **`withObservables`** HOC or hooks that `observe()` the query — avoid copying full row lists into Zustand unless profiling shows a need.

## Checklist

```
- [ ] Table + columns match model decorators
- [ ] Migration version incremented and runs on cold start
- [ ] New indexes considered for frequent queries (if API supports)
- [ ] Large lists use pagination or observe — not load-all in JS
```

## Anti-patterns

- Shipping schema changes without a migration.
- Storing base64 video in a string column.
- Duplicating the same entity in Zustand as the long-term store.
