/**
 * Project-owned facade over `react-native-media-toolkit` (Nitro / AVFoundation + Media3).
 *
 * Use this for lightweight trim, crop, compress, and thumbnails.
 * Cinema collage assembly (concat, photo segments, music mix) stays on FFmpegKit — see
 * `src/features/collage/logic/assembleCollage.ts` and `docs/native-media-stack-evaluation.md`.
 */

import { MediaToolkit } from 'react-native-media-toolkit';
import type {
  CompressImageOptions,
  CompressVideoOptions,
  CropOptions,
  FlipOptions,
  MediaResult,
  ProcessImageOptions,
  ProcessVideoOptions,
  RotateOptions,
  ThumbnailOptions,
  ThumbnailResult,
  TrimAndCropOptions,
  TrimOptions,
  VideoCropOptions,
} from 'react-native-media-toolkit';

export type {
  CompressImageOptions,
  CompressVideoOptions,
  CropOptions,
  FlipOptions,
  MediaResult,
  ProcessImageOptions,
  ProcessVideoOptions,
  RotateOptions,
  ThumbnailOptions,
  ThumbnailResult,
  TrimAndCropOptions,
  TrimOptions,
  VideoCropOptions,
};

/** Normalize paths from WatermelonDB / Vision Camera into a URI Nitro accepts (`file://` or `content://`). */
export function normalizeUriForNativeToolkit(uriOrPath: string): string {
  const s = uriOrPath.trim();
  if (!s) {
    throw new Error('Empty media path');
  }
  if (s.startsWith('file://') || s.startsWith('content://')) {
    return s;
  }
  return `file://${s}`;
}

/** Absolute filesystem path for options like `outputPath` that expect a plain path. */
export function toAbsoluteFsPath(uriOrPath: string): string {
  const uri = normalizeUriForNativeToolkit(uriOrPath);
  if (uri.startsWith('content://')) {
    return uri;
  }
  if (uri.startsWith('file://')) {
    return decodeURI(uri.replace(/^file:\/\//, ''));
  }
  return uri;
}

export async function toolkitCropImage(uriOrPath: string, options: CropOptions): Promise<MediaResult> {
  return MediaToolkit.cropImage(normalizeUriForNativeToolkit(uriOrPath), options);
}

export async function toolkitCompressImage(
  uriOrPath: string,
  options: CompressImageOptions,
): Promise<MediaResult> {
  return MediaToolkit.compressImage(normalizeUriForNativeToolkit(uriOrPath), options);
}

export async function toolkitCropVideo(
  uriOrPath: string,
  options: VideoCropOptions,
): Promise<MediaResult> {
  return MediaToolkit.cropVideo(normalizeUriForNativeToolkit(uriOrPath), options);
}

export async function toolkitTrimVideo(uriOrPath: string, options: TrimOptions): Promise<MediaResult> {
  return MediaToolkit.trimVideo(normalizeUriForNativeToolkit(uriOrPath), options);
}

export async function toolkitCompressVideo(
  uriOrPath: string,
  options: CompressVideoOptions,
): Promise<MediaResult> {
  return MediaToolkit.compressVideo(normalizeUriForNativeToolkit(uriOrPath), options);
}

export async function toolkitTrimAndCropVideo(
  uriOrPath: string,
  options: TrimAndCropOptions,
): Promise<MediaResult> {
  return MediaToolkit.trimAndCropVideo(normalizeUriForNativeToolkit(uriOrPath), options);
}

export async function toolkitGetThumbnail(
  uriOrPath: string,
  options?: ThumbnailOptions,
): Promise<ThumbnailResult> {
  return MediaToolkit.getThumbnail(normalizeUriForNativeToolkit(uriOrPath), options);
}

export async function toolkitFlipVideo(uriOrPath: string, options: FlipOptions): Promise<MediaResult> {
  return MediaToolkit.flipVideo(normalizeUriForNativeToolkit(uriOrPath), options);
}

export async function toolkitRotateVideo(
  uriOrPath: string,
  options: RotateOptions,
): Promise<MediaResult> {
  return MediaToolkit.rotateVideo(normalizeUriForNativeToolkit(uriOrPath), options);
}

export async function toolkitProcessVideo(
  uriOrPath: string,
  options: ProcessVideoOptions,
): Promise<MediaResult> {
  return MediaToolkit.processVideo(normalizeUriForNativeToolkit(uriOrPath), options);
}

export async function toolkitFlipImage(uriOrPath: string, options: FlipOptions): Promise<MediaResult> {
  return MediaToolkit.flipImage(normalizeUriForNativeToolkit(uriOrPath), options);
}

export async function toolkitRotateImage(
  uriOrPath: string,
  options: RotateOptions,
): Promise<MediaResult> {
  return MediaToolkit.rotateImage(normalizeUriForNativeToolkit(uriOrPath), options);
}

export async function toolkitProcessImage(
  uriOrPath: string,
  options: ProcessImageOptions,
): Promise<MediaResult> {
  return MediaToolkit.processImage(normalizeUriForNativeToolkit(uriOrPath), options);
}
