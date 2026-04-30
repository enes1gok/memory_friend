---
name: add-domain-feature
description: Adds or extends functionality inside a memory_friend feature module (journal, streak, capsule, ai, collage, coop, notification, subscription). Use when changing behavior under src/features/ or extending stores/models.
---

# Add domain feature (memory_friend)

## Pre-flight

1. Read the relevant product section in [`project_details.md`](../../project_details.md).
2. **Storage boundary** — decide before coding:
   - **WatermelonDB** — durable user records (entries, goals, capsules, badges, AI fields).
   - **MMKV** — fast flags, session cache, denormalized counters (see [.cursor/rules/data-layer.mdc](../rules/data-layer.mdc)).
   - **File system** — video/audio/photos; **paths only** in DB rows.
3. **Subscription** — if the feature is Pro-only (AI editing, 4K export, cloud backup, co-op, unlimited entries per PRD), plan gating early ([subscription-gate](../subscription-gate/SKILL.md)).

## Domain → code map

| Domain | Primary location |
|--------|------------------|
| Journal / capture | `src/features/journal/` |
| Streak / heatmap / badges | `src/features/streak/` |
| Time capsule | `src/features/capsule/` |
| OpenAI wrappers / prompts | `src/features/ai/` |
| FFmpeg / finale / collage | `src/features/collage/` |
| Co-op / duo | `src/features/coop/` |
| Notifee scheduling / channels | `src/features/notification/` |
| Tier checks / paywall hooks | `src/features/subscription/` |

Shared services: `src/services/`. Shared UI: `src/components/`. Screens: `src/screens/`.

## Where to put new code

| Kind | Put it in |
|------|-----------|
| Domain rules (pure) | `features/{domain}/logic/` or colocated `*.ts` |
| DB-backed operations | WatermelonDB models + repositories; see [add-watermelondb-model](../add-watermelondb-model/SKILL.md) |
| UI only for this domain | `features/{domain}/components/` |
| Cross-feature side effects | Prefer thin **events** or **services** — avoid circular imports between features |

## Post-change checklist

```
- [ ] Schema/migration if WatermelonDB shape changed
- [ ] MMKV key registry updated if new persisted flag
- [ ] i18n: all shipped locales ([add-i18n-key](../add-i18n-key/SKILL.md))
- [ ] testID on new interactives
- [ ] Subscription gate if Pro surface ([subscription-gate](../subscription-gate/SKILL.md))
- [ ] Notifications: engineering contract + reschedule/cancel if scheduling ([notification-system](../../rules/notification-system.mdc), [add-notification](../add-notification/SKILL.md)); copy aligns with behavioral rule
```

## Related skills

- New screen → [add-screen](../add-screen/SKILL.md)
- New table → [add-watermelondb-model](../add-watermelondb-model/SKILL.md)
- AI → [add-ai-feature](../add-ai-feature/SKILL.md)
