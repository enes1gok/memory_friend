---
name: add-error-boundary
description: >-
  Adds or wraps a React error boundary in memory_friend. Use when a screen,
  feature subtree, or the entire app needs graceful crash recovery instead of
  a white screen.
---

# Add error boundary (memory_friend)

## Why

React Native does not have a built-in error boundary component. Without one, an unhandled render error in any subtree crashes the entire app to a white or blank screen. An error boundary catches the error, shows a fallback UI, and optionally logs to telemetry.

## Where to place boundaries

| Scope | Location |
|-------|----------|
| Global (entire app) | Wrap `<NavigationContainer>` or the root in `App.tsx` |
| Screen-level | Wrap the screen component in its navigator registration |
| Feature subtree | Wrap `<FeatureWidget />` when the feature is non-critical (e.g. HypeMan modal, collage preview) |

Prefer narrower boundaries — a crash in the AI companion widget should not take down the capture flow.

## Implementation pattern

```tsx
// src/components/ErrorBoundary.tsx
import React from 'react';
import { View } from 'react-native';
import { Body, Heading } from '@/components/Typography';
import { PrimaryButton } from '@/components/PrimaryButton';

interface Props {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // TODO: forward to telemetry (Sentry, etc.) when wired
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <View className="flex-1 items-center justify-center px-6">
          <Heading className="mb-2 text-center">Something went wrong</Heading>
          <Body className="mb-6 text-center text-muted">
            We ran into an unexpected error. Tap below to try again.
          </Body>
          <PrimaryButton onPress={() => this.setState({ hasError: false, error: null })}>
            Try again
          </PrimaryButton>
        </View>
      );
    }
    return this.props.children;
  }
}
```

## Checklist

```
- [ ] ErrorBoundary component created in src/components/ErrorBoundary.tsx
- [ ] Global boundary wraps NavigationContainer in App.tsx
- [ ] Non-critical AI / collage subtrees have their own narrow boundary
- [ ] componentDidCatch forwards to telemetry when Sentry or similar is added
- [ ] Fallback UI copy follows behavioral-psychology.mdc (no shame, forward-looking)
- [ ] i18n: fallback strings through react-i18next (add-i18n-key skill)
```

## Anti-patterns

- One global boundary with no narrower ones — a widget crash kills the whole screen.
- Swallowing errors silently without logging.
- Using error boundaries for async errors (use try/catch for promises; boundaries only catch render-phase errors).

## Related

- Behavioral copy: [behavioral-psychology.mdc](../../rules/behavioral-psychology.mdc)
- i18n: [add-i18n-key](../add-i18n-key/SKILL.md)
