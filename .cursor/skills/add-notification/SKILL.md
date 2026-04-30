---
name: add-notification
description: Adds or changes Notifee channels, schedules, handlers, and copy for memory_friend. Use when editing local notifications, reminders, contextual nudges, or notification-related native config (e.g. app.config permissions).
---

# Add notification (Notifee)

## Read first (in order)

1. [.cursor/rules/notification-system.mdc](../rules/notification-system.mdc) — permissions, payloads, lifecycle, quiet hours, cancellation, testing (canonical technical contract).
2. [.cursor/rules/behavioral-psychology.mdc](../rules/behavioral-psychology.mdc) — tone: invite, don’t shame; contextual encouragement.
3. [.cursor/rules/index.mdc](../rules/index.mdc) — local-first default; remote push only with explicit backend design.

When changing user-visible copy, follow [add-i18n-key](../add-i18n-key/SKILL.md) and verify locale parity with [sync-locales](../sync-locales/SKILL.md).

---

## Workflow (before coding)

1. **Specify the notification:** human-readable purpose, frequency (once / daily / on date), priority (critical vs deferrable), and product owner for quiet-hour behavior.
2. **Channel:** reuse a `CHANNEL_IDS` entry or add one in `channels.ts` with stable id and documented `AndroidImportance`. iOS: categories only if actions are required.
3. **Payload contract:** discriminant `type`, `screen`, and entity ids (`goalId`, `capsuleId`, …) as strings. Document handlers that must navigate from each `type`.
4. **Triggers:** timestamp vs interval; ensure **future-only** timestamps; define past-time behavior (reschedule vs skip + log).
5. **Quiet hours:** use shared prefs or centralized helpers — see `notification-system.mdc` — never one-off literals without documenting migration to prefs.
6. **Cancel paths:** goal complete/delete, capsule delete/edit date, logout, user toggle off reminders.
7. **Resync points:** app foreground, goal/target change, reminder hour change, permission grant — list which screens or hooks will call reconcile.
8. **MMKV:** new keys only via [`src/utils/mmkvKeys.ts`](../../src/utils/mmkvKeys.ts) with logout vs device scope.

---

## Implementation order

1. **Permission surface** — one shared hook or helper (`getNotificationSettings`, `requestPermission`, settings deep link when denied). Do not duplicate permission logic ad hoc.
2. **Channel(s)** — `ensureChannels()` before triggers; stable ids.
3. **Copy** — all strings via i18n; interpolation (`goalName`, `streak`, `count`) consistent with ICU/plural keys where needed.
4. **Schedule** — idempotent cancel/replace, then `createTriggerNotification`; handle errors; Android `alarmManager` when delivery after idle matters.
5. **Handlers** — `getInitialNotification` + `onForegroundEvent` (+ background as needed) wired from a navigator or app root mount per existing patterns.
6. **Resync wiring** — `AppState` active, deps on goal/target/prefs, permission changes.
7. **Documentation** — if behavior is non-obvious, one-line comment referencing `notification-system.mdc` invariant.

---

## Tone checklist

- [ ] Copy references **progress** or **next step**, not guilt.
- [ ] Final stretch / milestone variants where PRD applies.
- [ ] No accusatory language on missed days for motivational pings.

---

## Technical checklist

```
- [ ] Read notification-system.mdc + behavioral psychology for this change
- [ ] Channel id stable and documented (no casual renames)
- [ ] Payload: type + screen + ids for deep navigation
- [ ] SCHEDULE_AUTHORIZED paths only; graceful no-op + log otherwise
- [ ] Idempotent: cancel/replace existing trigger ids for same logical notification
- [ ] Quiet hours / prefs centralized or explicitly documented transitional default
- [ ] Resync on foreground + relevant entity/pref changes
- [ ] Cancel paths: logout, goal completion, capsule delete, user disable (per product)
- [ ] Manual test matrix: Android (channels, denial, reboot if relevant) + iOS (cold start tap, foreground tap, permission denial)
```

---

## Anti-patterns

- Hardcoded English in notification title/body/channel name where user-visible (channel **name** on Android is user-visible via i18n).
- Scheduling without checking authorization.
- Assuming schedule always succeeds — handle errors and stale triggers.
- Duplicating quiet-hour logic across files without shared policy.
- Implicit remote push without backend, token lifecycle, and consent design.

---

## Related rules

| Topic | Rule / doc |
|------|------------|
| Empathetic copy & streak framing | [.cursor/rules/behavioral-psychology.mdc](../rules/behavioral-psychology.mdc) |
| Notification engineering contract | [.cursor/rules/notification-system.mdc](../rules/notification-system.mdc) |
| MMKV key registry | [.cursor/rules/data-layer.mdc](../rules/data-layer.mdc) |
