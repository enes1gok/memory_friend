# memory_friend — Claude Code guide

## Project identity

Goal-linked video/photo journal app. Users set a goal + target date, capture daily 15-second check-ins, and on the target day receive a cinematic collage of their journey. Offline-first, dark mode, React Native / Expo Dev Build.

**Framework:** Expo Dev Build (not Expo Go — native modules required)
**Navigation:** React Navigation (Stack + Tabs — not file-based routing)
**Node:** >= 20

## Quick-start commands

```bash
npm run lint              # ESLint (run after any TS/TSX edit)
npx tsc --noEmit          # Type-check without emitting
npm run doctor            # expo-doctor: dependency health
node .cursor/skills/sync-locales/scripts/check-locales.js  # i18n parity check
```

> Do NOT run `expo start` — this is a Dev Build; use `expo run:android` / `expo run:ios` on device after `npm run prebuild:android` / `prebuild:ios`.

## Tech stack

| Area | Technology | Notes |
|------|-----------|-------|
| State (UI) | Zustand | Atomic selectors + `useShallow`; avoid whole-store subscriptions |
| Persistent data | WatermelonDB | Source of truth for entities; offline-first |
| Fast cache | react-native-mmkv | Timers, streak cache, session flags — keys in `src/utils/mmkvKeys.ts` |
| Camera | react-native-vision-camera | Video + photo capture |
| Media processing | FFmpegKit + react-native-media-toolkit | FFmpegKit for collage merge/mux; toolkit for trim/compress/thumbnails |
| Notifications | Notifee | Local-first scheduling; remote push only with explicit backend design |
| AI | OpenAI (Whisper + GPT-4o-mini) | Speech-to-text + emotion tagging; never blocks capture |
| Styling | NativeWind (TailwindCSS) | `className` first; legacy StyleSheet only where tokens don't reach |
| i18n | react-i18next | 7 locales: en, tr, es, de, zh, it, fr |

## Directory map

```
src/
  features/
    ai/             OpenAI client, transcription, emotion tagging, companion nudge
    capsule/        Time-capsule create / unlock / delivery
    collage/        FFmpeg collage assembly, finale export
    coop/           Co-op / shared journeys (stub, Phase 10+)
    journal/        Capture flow, quick-add, entry cards
    notification/   Notifee channels, triggers, copy, reschedule
    streak/         Streak engine, badges, heatmap, celebrations
    subscription/   Tier checks + paywall entry points (stub until RevenueCat)
  models/           WatermelonDB model classes
  database/         schema.ts, migrations/, database setup
  stores/           Zustand stores (useGoalStore, useUIStore)
  services/         API clients + cross-cutting IO (mediaToolkit.ts)
  utils/            haptics, mmkv, mmkvKeys, persistJournalMedia
  i18n/locales/     en.json (source) + 6 translated files
  components/       Shared presentational components
  screens/          Screen entry components wired from navigators
  navigation/       Root, Tab, Onboarding navigators + types
  theme/            Design tokens: colors, accent, fonts, spacing, motion
```

## Storage invariants (non-negotiable)

1. **WatermelonDB** — durable user entities. Never store binary blobs; store file paths only.
2. **MMKV** — fast flags and caches. Every key must live in `src/utils/mmkvKeys.ts`. Must be rebuildable from WatermelonDB if wiped.
3. **File system** — large media under `documentDirectory` (committed) or `cacheDirectory` (temp). Delete cache on cancel/error.
4. **OpenAI** — no silent mass upload; network calls need offline-safe UI and explicit consent.

## Architectural invariants

- **Offline-first:** Core flows (capture, view journal, streak) work without network. AI enhances, never blocks.
- **Local media:** Prefer on-device FFmpeg over server unless spec says otherwise.
- **AI must never block capture.** Save raw media + empty transcript; retry in background.
- **Subscription gates** live exclusively in `src/features/subscription/` via `can*` helpers. No scattered `'pro'` string checks.
- **Notifications (local-first):** Core reminders work offline. Remote push requires explicit backend + consent design.
- **Empathetic UX:** No shame, accusation, or red "error" framing for empty states or missed days.

## Schema + migrations

- Schema: `src/database/schema.ts` (version currently 2)
- New column → new migration in `src/database/migrations/` **in the same PR** as model changes
- Bump schema version exactly once per PR that changes tables

## i18n workflow

`en.json` is canonical. All 7 locales must stay in structural parity. After any key change:
```bash
node .cursor/skills/sync-locales/scripts/check-locales.js
```
Exits 0 when all locales match. See `.cursor/skills/sync-locales/SKILL.md` for workflow.

## Security

- `EXPO_PUBLIC_OPENAI_API_KEY` is exposed in the client bundle (acceptable for prototype / internal builds). For public app-store release, route through a server-side proxy — see `.cursor/rules/security.mdc`.
- Never commit `.env` files with real secrets.
- No `dangerouslyAllowBrowser: true` equivalent patterns in production unless clearly documented.

## Testing

Pure logic functions (`computeStreak`, `badgeRules`, `journeyPercent`, `policy`, etc.) are the first targets for unit tests. No test runner is configured yet — see `.cursor/rules/testing.mdc` for the plan and setup steps.

## Detailed rules (`.cursor/rules/`)

| Topic | File |
|-------|------|
| Project constitution, stack, invariants | `index.mdc` |
| Rule routing map | `master.mdc` |
| TypeScript, Zustand, WatermelonDB patterns | `technical-excellence.mdc` |
| Screens, layout, NativeWind, motion | `ui-ux-design.mdc` |
| WatermelonDB models, migrations, MMKV keys | `data-layer.mdc` |
| Vision Camera, FFmpegKit, file lifecycle | `media-processing.mdc` |
| Streak integrity, notifications tone, AI companion | `behavioral-psychology.mdc` |
| Notifee channels, triggers, quiet hours | `notification-system.mdc` |
| Security: API keys, data privacy | `security.mdc` |
| Testing: unit, integration patterns | `testing.mdc` |

## Skills (`.cursor/skills/`)

| Skill | Use when |
|-------|----------|
| `add-i18n-key` | Any user-visible string added/changed |
| `add-screen` | New React Navigation screen |
| `add-domain-feature` | Work inside `src/features/*` |
| `add-watermelondb-model` | New table, model class, migration |
| `add-notification` | Notifee channels, triggers, copy |
| `subscription-gate` | Free vs Pro gating |
| `add-ai-feature` | OpenAI / Whisper / GPT integration |
| `sync-locales` | After any i18n key change |
