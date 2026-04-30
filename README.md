# memory_friend

Expo (dev build) app with offline-first journal, camera capture, and native modules.

## Requirements

- Node `>= 20`
- For local native runs: Xcode (iOS), Android SDK (Android)

## Quick start

```bash
npm install
npm start
```

This project uses native modules, so use a **development build** or `expo run:*`, not Expo Go alone.

## Native builds (CNG)

Generated `ios/` and `android/` are ignored; customize via `app.config.js` and config plugins. See **[docs/native-development.md](docs/native-development.md)**.

Check native config and regenerate locally:

```bash
npm run verify:native-config
```

## EAS

Configure profiles in [`eas.json`](eas.json). Example:

```bash
npx eas-cli build --platform all --profile production
```

Ensure signing credentials are configured with EAS (`eas credentials`), never committed.
