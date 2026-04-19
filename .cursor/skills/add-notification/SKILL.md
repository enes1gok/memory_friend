---
name: add-notification
description: Adds or changes Notifee channels, schedules, and copy for memory_friend. Use when editing local/push notifications, reminders, or contextual nudges.
---

# Add notification (Notifee)

## Read first

- [.cursor/rules/behavioral-psychology.mdc](../rules/behavioral-psychology.mdc) — tone: invite, don’t shame; contextual encouragement.
- [.cursor/rules/index.mdc](../rules/index.mdc) — quiet hours and user prefs must be respected.

## Implementation order

1. **Channel** — Create or reuse an Android channel (`notifee.createChannel`) with correct importance; iOS categories if needed.
2. **Copy** — All strings via i18n ([add-i18n-key](../add-i18n-key/SKILL.md)); support interpolation (`{{goalName}}`, etc.).
3. **Schedule** — Use Notifee `trigger` types appropriate to the use case (timestamp, interval). Ensure triggers are **in the future**; handle past times with reschedule or skip + log.
4. **Quiet hours** — Read user preferences (e.g. start/end); skip or defer non-critical notifications.
5. **Resync** — When prefs change, cancel/replace scheduled notifications so OS state matches app state.

## Tone checklist

- [ ] Copy references **progress** or **next step**, not guilt
- [ ] “Final stretch” / milestone variants where PRD applies
- [ ] No accusatory language on missed days for motivational pings

## Technical checklist

```
- [ ] Channel id stable and documented
- [ ] Payload includes enough data to deep-link or open correct screen
- [ ] Cancel path on logout / goal completion if product requires
- [ ] Test on Android (channels) + iOS (permissions / categories)
```

## Anti-patterns

- Hardcoded English in notification body.
- Scheduling without checking quiet hours.
- Assuming schedule always succeeds — handle errors and stale triggers.
