---
name: add-screen
description: Creates a new Expo Router screen or page with correct placement, navigation, i18n, accessibility, and state patterns. Use when adding a route under app/, a new tab, a stack screen, a modal, or a deep-link entry screen.
---

# Add screen

## Choose route shape first

| Goal | Where to add |
|------|----------------|
| New main tab | `app/(tabs)/` — update the tab layout if needed |
| Nested stack (e.g. settings) | Under the relevant stack folder, e.g. `app/settings/` or your app’s stack |
| One-off modal / deep link | Root `app/` (e.g. `app/share.tsx`); set `presentation: 'modal'` on `Stack.Screen` if required |
| Heavy UI + local components | Implementation in `src/screens/{Name}/` (or `src/screens/{Name}.tsx`); keep the route file a thin wrapper |

Follow patterns in `app/_layout.tsx` (and parent layouts) for `Stack.Screen` options.

## Navigation guard

Root bootstrap, splash, auth/onboarding redirects, and provider order usually live in `app/_layout.tsx`. New routes should stay **inside the existing tree** so guards still apply — do not mount a parallel navigator that skips root `_layout`.

## UI and quality bar

1. **i18n**: all copy via `t(...)`; update all locale files ([add-i18n-key](../add-i18n-key/SKILL.md)).
2. **testID** on pressables/inputs/switches: `{domain}:{component}:{action}` (see [.cursor/rules/ui-ux-design.mdc](../rules/ui-ux-design.mdc)).
3. **a11y**: `accessibilityRole` + `accessibilityLabel` (localized) on new interactives.
4. **Styling**: NativeWind `className` for new UI when the project uses it; migrate off `StyleSheet` only when touching legacy files in the same change.
5. **Haptics**: shared helper (e.g. `src/utils/haptics.ts`), not scattered raw `expo-haptics` imports.

## State

- Use **atomic** Zustand selectors with `useShallow` when selecting multiple fields ([.cursor/rules/technical-excellence.mdc](../rules/technical-excellence.mdc)).
- Do **not** subscribe to an entire store in new screens without a selector.

## Cross-cutting behavior

If a screen coordinates multiple features, prefer loose coupling (context, events, or a small coordinator) over importing many unrelated stores from one file — follow patterns already in the repo.

## E2E

If the flow is user-critical, add or extend Maestro (or your E2E tool) flows under the project’s E2E folder using the same `testID`s.
