# Native projects (Expo CNG)

This app uses **Continuous Native Generation (CNG)**. The `ios/` and `android/` directories are **generated** by Expo prebuild and are **listed in `.gitignore`**. They must not be committed.

## Source of truth

- **[`app.config.js`](../app.config.js)** — bundle IDs, icons, splash, permissions copy, Expo plugins.
- **`plugins/`** — custom **config plugins** that patch generated native projects at prebuild time (see files in that folder).
- **`package.json`** — native modules (Vision Camera, Notifee, WatermelonDB, MMKV, FFmpegKit, react-native-media-toolkit for lightweight thumbnails and edits, etc.).
- **[`native-media-stack-evaluation.md`](native-media-stack-evaluation.md)** — FFmpeg vs Nitro media toolkit boundaries and nitro-media-kit spike notes.

Do **not** rely on hand-edits inside generated `ios/` or `android/` folders; those changes are lost on the next `expo prebuild --clean`. Encode durable fixes in `app.config.js` or a config plugin.

## Local workflow

```bash
npm install
npx expo prebuild --clean   # regenerates ios/ and android/ locally (untracked)
npx expo run:ios
npx expo run:android
```

## EAS builds

Store and internal builds run prebuild on EAS servers from the same config. See **[`eas.json`](../eas.json)** and [Expo EAS Build docs](https://docs.expo.dev/build/introduction/).

## Verification (config and codegen)

```bash
npm run verify:native-config
```

This runs lint, `expo doctor`, and a clean prebuild. It does **not** replace a full Xcode or Gradle compile.

## Android builds and FFmpegKit

`ffmpeg-kit-react-native` pulls native binaries that are no longer on Maven Central. Resolving that for **release Android Gradle builds** is part of the **media processing** track, not this CNG checklist. Until that is addressed, expect `./gradlew :app:assemble*` to fail at dependency resolution for `com.arthenica:ffmpeg-kit-https`. iOS CocoaPods can still succeed when the existing iOS mirror plugin applies.

## Useful checks

```bash
npm run lint
npm run doctor
```

## Manual QA: local notifications (Notifee)

Run on physical devices after changing notification logic. Core flows:

- **Daily reminder**: After onboarding with permission granted, confirm one trigger at the next boundary; tap notification from **cold start** and **foreground**; expect Capture tab (`MainTabs` → Capture). Change `notification:reminderHour` equivalent in app (if surfaced) or MMKV-backed hour and verify reschedule without waiting for reinstall.
- **Capsule unlock**: Create capsule with unlock in near future (respect quiet-hours adjustment); tap notification; expect `CapsuleReveal`. If scheduling fails mid-flight, capsule MMKV schedule map stays consistent—no orphaned false positive in storage.
- **AI companion**: When stress heuristic fires, verify one companion nudge per day; tap leads to Home tab.
- **Permission revoke**: In system settings revoke notification permission; return to app; daily triggers should cancel (no lingering MMKV IDs implying active alarms). Restore permission; foreground resume should reschedule for active goals.
