# Native media stack evaluation

This document records how **memory_friend** splits media work between **FFmpegKit** and **`react-native-media-toolkit`**, and how **`react-native-nitro-media-kit`** might factor into a future FFmpeg removal.

## Current split (implemented)

| Concern | Stack | Notes |
|--------|--------|------|
| Journal video list thumbnails | `react-native-media-toolkit` via [`src/services/mediaToolkit.ts`](../src/services/mediaToolkit.ts) | [`JournalEntryCard`](../src/features/journal/components/JournalEntryCard.tsx) writes JPEGs under cache `journal_thumbs/`. |
| Cinema finale collage | `ffmpeg-kit-react-native` | [`assembleCollage.ts`](../src/features/collage/logic/assembleCollage.ts): still image to timed segment, scale/pad, concat demuxer, optional Pro music mux (`-stream_loop`, AAC). |

FFmpegKit cancellation stays wired to collage generation ([`useGenerateCollage`](../src/features/collage/hooks/useGenerateCollage.ts), [`CollagePremiereScreen`](../src/screens/CollagePremiereScreen/index.tsx)).

## `react-native-media-toolkit` (in repo)

- **Engines:** AVFoundation (iOS), Jetpack Media3 Transformer (Android); Nitro Modules (JSI).
- **Good fit:** trim, crop, trim+crop, compress, thumbnails, image crop/compress (see package typings).
- **Not a drop-in for collage:** no built-in concat of many clips, no bundled MP3 mux with `-shortest`-style semantics, no FFmpeg-style filtergraphs for photo loops.

## Spike: `react-native-nitro-media-kit` (not installed)

Evaluate **before** removing FFmpegKit. Public README APIs suggest:

| Needed collage capability | Nitro media kit signal | Gap / risk |
|---------------------------|-------------------------|------------|
| Photo as N-second segment | `convertImageToVideo` | FPS/duration parity vs current 5s PhotoJPEG segments must be validated per device. |
| Concatenate normalized clips | `mergeVideos` | Expects workable MP4/H.264 inputs; mismatched sizes trigger re-encode (performance + quality testing). |
| Optional emotion music track | No dedicated mux API documented like FFmpeg `-map 0:v -map 1:a` | Likely needs AVFoundation / MediaMuxer path or keeping a small FFmpeg step. |
| Cancel mid-job | Compare with existing `FFmpegKit.cancel()` UX | Confirm Nitro APIs support cooperative cancel or user-visible abort. |
| Android codec quirks | README warns odd dimensions → black frames | Align export widths/heights with even dimensions (already relevant for Pro resolutions). |

**Verdict:** Treat nitro-media-kit as a **research dependency**. Only adopt if a spike proves parity for merge, photo segments, audio mix (or product accepts separate audio handling), EAS builds, and cancellation.

## Validation checklist (developers)

After native dependency changes:

1. `npm run lint`
2. `npm run doctor`
3. `npx expo prebuild --clean`
4. `npx expo run:ios` / `npx expo run:android`
5. Device smoke: capture journal video, open journal list (thumbnail path), generate collage finale (FFmpeg path).

Real-device checks matter for hardware encoders and gallery `content://` URIs on Android.
