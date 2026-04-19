---
name: add-i18n-key
description: Adds or updates i18n keys in locale files and wires them through react-i18next. Use when adding or changing user-visible copy, labels, button text, alerts, notification strings, or any JSX string that users see.
---

# Add i18n key

## Files

- Locale JSON (or TS) under your i18n folder — e.g. `src/i18n/locales/en.json`, `src/i18n/locales/tr.json` (adjust paths to match the project).
- Usage: `import { useTranslation } from 'react-i18next'` → `const { t } = useTranslation();` → `t('namespace.key')` or nested `t('namespace.section.key')`.

## Namespaces and keys

- Pick a **top-level namespace** (or nested prefix) that matches the feature or screen (`general`, `settings`, `auth`, etc.).
- Use **camelCase** leaf keys consistent with siblings in that namespace.
- If nothing fits, **extend** the closest existing namespace rather than inventing many parallel roots.

## Workflow checklist

Copy and track:

```
- [ ] Chose namespace + camelCase leaf keys (consistent with siblings)
- [ ] Added key + value to every configured locale file in the same change
- [ ] Replaced hardcoded strings in TSX with t('...')
- [ ] Used interpolation for variables: "{{name}}" in JSON, t('key', { name })
```

## Rules

1. **Never** ship user-visible literals in production JSX for strings that belong in i18n — use `t(...)`.
2. **Always** update **all** locale files the app ships with in the same change (not just one language).
3. Keep nesting shallow where possible; mirror structure between locales exactly.
4. Keep notification or long-form copy under a clear namespace (e.g. `notifications.*`) if your app uses structured notification strings.

## Anti-patterns

- Updating only one locale (breaks users of other languages).
- Different key shapes between locale files (missing keys or parse issues at runtime).
