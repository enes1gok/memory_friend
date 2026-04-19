---
name: subscription-gate
description: Gates memory_friend features behind Free vs Pro using FeatureLimits, subscription store, and paywall UX. Use when limiting exports, AI, cloud backup, co-op, or resolution.
---

# Subscription gate (memory_friend)

## Product rules (PRD summary)

**Free:** Daily journal, basic heatmap, standard/simple finale export.

**Pro:** AI-powered cinematic editing, licensed adaptive music, **4K** export, custom aspect ratios (e.g. Reels), **unlimited cloud backup**, **co-op** / shared journey features (when built).

Adjust `FeatureKey` / limits if product docs change.

## Data model

1. **`src/types/subscription.ts`** (or project equivalent)
   - `SubscriptionTier`: `'free' | 'pro'` (names per your billing provider).
   - `FeatureKey` union for boolean gates used in multiple places.
   - `FeatureLimits` + **`TIER_LIMITS`** for numeric caps (e.g. max monthly AI minutes, max export resolution).

2. **`src/stores/subscriptionStore.ts`** (or context)
   - `isPro`, `tier`, and **`can*` helpers** (`canUseAiEditing`, `canExport4k`, `canUseCloudBackup`, `canUseCoop`, …) derived from `TIER_LIMITS[tier]` + entitlements.

## Enforcement

3. **Feature entry points** — Call `can*` before starting expensive work (FFmpeg 4K path, OpenAI job, upload).
4. **UI** — Soft: inline upsell; hard: full-screen paywall. Keep **one** primary `presentPaywall()` / navigation target to avoid fragmented purchase flows.

## Anti-patterns

- Scattered `'pro'` string checks — centralize in subscription module.
- Changing limits without updating i18n for paywall bullets.
- Blocking **free** core journal flows that PRD guarantees stay free.

## Related

- Domain wiring: [add-domain-feature](../add-domain-feature/SKILL.md)
- AI limits: [add-ai-feature](../add-ai-feature/SKILL.md)
