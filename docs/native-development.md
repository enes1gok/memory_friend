# Native projects (Expo CNG)

This app uses **Continuous Native Generation (CNG)**. The `ios/` and `android/` directories are **generated** by Expo prebuild and are **listed in `.gitignore`**. They must not be committed.

## Source of truth

- **[`app.config.js`](../app.config.js)** — bundle IDs, icons, splash, permissions copy, Expo plugins.
- **`plugins/`** — custom **config plugins** that patch generated native projects at prebuild time (see files in that folder).
- **`package.json`** — native modules (Vision Camera, Notifee, WatermelonDB, MMKV, etc.).

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
