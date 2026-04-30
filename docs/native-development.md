# Native projects (Expo CNG)

This app uses **Continuous Native Generation (CNG)**. The `ios/` and `android/` directories are **generated** by Expo prebuild and are **listed in `.gitignore`**. They must not be committed.

## Source of truth

- **[`app.config.js`](../app.config.js)** — bundle IDs, icons, splash, permissions copy, Expo plugins.
- **`plugins/`** — custom **config plugins** that patch generated native projects at prebuild time (for example `withAndroidMavenRepos.js` for Notifee plus FFmpegKit Maven resolution, and `withFfmpegKitIosMirrorPod.js` for iOS FFmpeg binaries).
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

Platform-only clean prebuild (same as full clean, scoped to one platform):

```bash
npm run prebuild:android && npm run android
npm run prebuild:ios && npm run ios
```

**Stale dev client:** If you add a dependency with native views but keep an old dev client on device, Fabric can crash at startup with `IllegalViewOperationException` from `ViewManagerRegistry.get(...)`. The JS bundle references a native view type that the APK never linked. Run the matching `prebuild:*` + `npm run android` / `npm run ios` after any native npm change. See `_nativeRebuildHint` in `package.json`.

## EAS builds

Store and internal builds run prebuild on EAS servers from the same config. See **[`eas.json`](../eas.json)** and [Expo EAS Build docs](https://docs.expo.dev/build/introduction/).

## Verification (config and codegen)

```bash
npm run verify:native-config
```

This runs lint, `expo doctor`, and a clean prebuild. It does **not** replace a full Xcode or Gradle compile.

## Android builds and FFmpegKit

`ffmpeg-kit-react-native` pulls `com.arthenica:ffmpeg-kit-https`, which was removed from Maven Central when FFmpegKit retired. **`plugins/withAndroidMavenRepos.js`** adds a Central mirror plus Notifee’s local Maven repo during prebuild so `./gradlew :app:assemble*` and `npx expo run:android` can resolve those artifacts. iOS uses **`plugins/withFfmpegKitIosMirrorPod.js`** for the vendored FFmpegKit podspec.

### New Architecture (Fabric) note

`ffmpeg-kit-react-native` has no Fabric codegen; with `newArchEnabled: true` it relies on bridge interop. It does not register Fabric ViewManagers, so it is unrelated to `ViewManagerRegistry` crashes, but TurboModule calls can still fail if the binary is stale or the library lags RN.

**Smoke test after each native rebuild:** run a collage finale that hits the FFmpeg path (`src/features/collage/`, e.g. `assembleCollage.ts`). Confirm cancel and success paths. If FFmpeg fails at runtime or maintenance becomes untenable, prefer extending **`react-native-media-toolkit`** / Nitro paths per **[`native-media-stack-evaluation.md`](native-media-stack-evaluation.md)** instead of growing FFmpeg usage.

## Useful checks

```bash
npm run lint
npm run doctor
```

## Manual QA: local notifications (Notifee)

Run on physical devices after changing notification logic. Core flows:

- **Daily reminder**: After onboarding with permission granted, confirm one trigger at the next boundary; tap notification from **cold start** and **foreground**; expect the Capture screen (`root.navigate('Capture')`). Change `notification:reminderHour` equivalent in app (if surfaced) or MMKV-backed hour and verify reschedule without waiting for reinstall.
- **Capsule unlock**: Create capsule with unlock in near future (respect quiet-hours adjustment); tap notification; expect `CapsuleReveal`. If scheduling fails mid-flight, capsule MMKV schedule map stays consistent—no orphaned false positive in storage.
- **AI companion**: When stress heuristic fires, verify one companion nudge per day; tap leads to Home tab.
- **Permission revoke**: In system settings revoke notification permission; return to app; daily triggers should cancel (no lingering MMKV IDs implying active alarms). Restore permission; foreground resume should reschedule for active goals.
