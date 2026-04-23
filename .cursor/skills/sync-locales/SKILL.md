---
name: sync-locales
description: >-
  Keeps all 7 locale JSON files (en, tr, es, de, zh, it, fr) in structural
  parity. Use when adding, removing, or renaming any i18n key, when adding a
  new language, or when the agent needs to verify that no locale is missing keys
  relative to en.json.
---

# Sync locales (i18n parity)

## Supported locales

| Code | Language            | File                 |
|------|---------------------|----------------------|
| `en` | English (source)    | `src/i18n/locales/en.json` |
| `tr` | Turkish             | `src/i18n/locales/tr.json` |
| `es` | Spanish             | `src/i18n/locales/es.json` |
| `de` | German              | `src/i18n/locales/de.json` |
| `zh` | Chinese (Simplified)| `src/i18n/locales/zh.json` |
| `it` | Italian             | `src/i18n/locales/it.json` |
| `fr` | French              | `src/i18n/locales/fr.json` |

## Wiring `src/i18n/index.ts`

Register every locale in `resources` (mirror this pattern when codes change):

```ts
import en from './locales/en.json';
import tr from './locales/tr.json';
import es from './locales/es.json';
import de from './locales/de.json';
import zh from './locales/zh.json';
import it from './locales/it.json';
import fr from './locales/fr.json';

void i18next.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    tr: { translation: tr },
    es: { translation: es },
    de: { translation: de },
    zh: { translation: zh },
    it: { translation: it },
    fr: { translation: fr },
  },
  // ...
});
```

## Workflow checklist

Copy and track:

```
- [ ] Updated en.json (source of truth): same nesting as siblings; camelCase leaves
- [ ] Mirrored every changed path in tr, es, de, zh, it, fr (translate values; keep {{vars}} identical)
- [ ] Ran: node .cursor/skills/sync-locales/scripts/check-locales.js (fix missing/extra keys)
- [ ] Confirmed src/i18n/index.ts imports + resources include all shipped locales
```

## Rules

1. **en.json is canonical** — add/remove/rename keys there first; other locales must match key paths exactly.
2. **No partial locales** — do not merge a change that leaves any shipped locale missing a key present in `en.json`, or with extra keys not in `en.json`.
3. **Interpolation** — preserve placeholders exactly (`{{count}}`, `{{name}}`, `{{goalName}}`, etc.).
4. **Plurals** — keep i18next plural suffix keys in sync (e.g. `daysLeft_one`, `daysLeft_other`).
5. **Structure** — shallow nesting where possible; identical object shape across all locale files.

## Running the validator

From the **repository root**:

```bash
node .cursor/skills/sync-locales/scripts/check-locales.js
```

Exits `0` when all locales match `en.json` keys; `1` when any locale is missing or has extra keys (prints details).

## What this skill does not do

- It does not auto-translate — supply accurate copy per language.
- It does not edit JSON for you — it validates and documents the workflow.

## Anti-patterns

- Updating only `en.json` or one non-English file.
- Renaming a key in one locale but not others.
- Drifting placeholder names or dropping plural variants.
