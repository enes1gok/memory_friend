---
name: add-screen
description: Adds a React Navigation screen for memory_friend with placement, i18n, accessibility, and state patterns. Use when registering a new route on a Stack or Tab navigator, or adding a modal screen.
---

# Add screen (React Navigation)

memory_friend uses **React Navigation** (not file-based routing). Screens are typically implemented under `src/screens/` and registered from a root or feature navigator.

## Choose route shape first

| Goal | Where to add |
|------|----------------|
| New main tab | Register on the **Tab** navigator; add tab icon + label (i18n). |
| Stack push (detail, settings) | Register `Stack.Screen` on the parent **Stack** with `name` + `component`. |
| Modal | Same stack with `options={{ presentation: 'modal' }}` (platform-specific tuning as needed) or a dedicated modal stack. |
| Heavy UI + local components | Implementation in `src/screens/{Name}/` (or `src/screens/{Name}.tsx`); keep the navigator entry a thin wrapper. |

Follow existing patterns in the project’s root navigator file (e.g. `App.tsx`, `src/navigation/RootNavigator.tsx`).

## Navigation guard

Bootstrap order (providers, persistence, auth/onboarding) must wrap the **NavigationContainer** (or live inside the same root as established in the repo). New screens must remain **reachable** from the existing graph — avoid orphan navigators that skip onboarding or subscription providers.

## UI and quality bar

1. **i18n**: all copy via `t(...)`; update all locale files ([add-i18n-key](../add-i18n-key/SKILL.md)).
2. **testID** on pressables/inputs/switches: `{domain}:{component}:{action}` (see [.cursor/rules/ui-ux-design.mdc](../rules/ui-ux-design.mdc)).
3. **a11y**: `accessibilityRole` + `accessibilityLabel` (localized) on new interactives.
4. **Styling**: NativeWind `className` when the project uses it; otherwise theme tokens / StyleSheet per project conventions.
5. **Haptics**: shared helper (e.g. `src/utils/haptics.ts`), not scattered raw `expo-haptics` imports.

## State

- Use **atomic** Zustand selectors with `useShallow` when selecting multiple fields ([.cursor/rules/technical-excellence.mdc](../rules/technical-excellence.mdc)).
- Prefer **WatermelonDB-observed** lists for journal/history screens ([.cursor/rules/data-layer.mdc](../rules/data-layer.mdc)).

## Params and types

- Type `route.params` with a dedicated **TypeScript** interface per screen; export from a `navigation/types.ts` (or feature module) if the project uses a central param list.

## E2E

If the flow is user-critical, add or extend Maestro (or your E2E tool) flows using the same `testID`s.
