import { FFmpegKit } from 'ffmpeg-kit-react-native';
import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Finale collage export uses FFmpegKit: photo-to-video segments, scale/pad, concat,
 * optional Pro music mux (AAC). Lightweight trim/compress/thumbnails use
 * `react-native-media-toolkit` via `@/services/mediaToolkit` elsewhere — do not replace
 * this pipeline until native alternatives cover merge + audio mix + still segments.
 */

export type CollageTier = 'free' | 'pro';

export type CollageAspectRatio = '16:9' | '9:16';

export type CollageClipInput = {
  path: string;
  mediaType: string;
};

export type CollagePhase = 'trimming' | 'merging' | 'mixing';

export type AssembleCollageOptions = {
  onPhase?: (phase: CollagePhase) => void;
  /** Pro-only; defaults to 16:9. */
  aspectRatio?: CollageAspectRatio;
};

export class CollageCancelledError extends Error {
  constructor() {
    super('Collage assembly was cancelled');
    this.name = 'CollageCancelledError';
  }
}

const CLIP_SECONDS = 5;

function stripFileScheme(uri: string): string {
  if (uri.startsWith('file://')) {
    return decodeURI(uri.replace(/^file:\/\//, ''));
  }
  return uri;
}

function vfScale(tier: CollageTier, aspect: CollageAspectRatio): string {
  if (aspect === '9:16') {
    return tier === 'pro'
      ? 'scale=2160:3840:force_original_aspect_ratio=decrease,pad=2160:3840:(ow-iw)/2:(oh-ih)/2'
      : 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2';
  }
  return tier === 'pro'
    ? 'scale=3840:2160:force_original_aspect_ratio=decrease,pad=3840:2160:(ow-iw)/2:(oh-ih)/2'
    : 'scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2';
}

/** H.264 encode args (hardware on device). */
function videoEncodeArgs(): string[] {
  if (Platform.OS === 'ios') {
    return ['-c:v', 'h264_videotoolbox', '-b:v', '6M', '-pix_fmt', 'yuv420p', '-an'];
  }
  return ['-c:v', 'h264_mediacodec', '-b:v', '6M', '-pix_fmt', 'yuv420p', '-an'];
}

function concatListLine(path: string): string {
  const escaped = path.replace(/'/g, `'\\''`);
  return `file '${escaped}'`;
}

async function runFfmpeg(args: string[]): Promise<void> {
  const session = await FFmpegKit.executeWithArguments(args);
  const returnCode = await session.getReturnCode();
  if (returnCode.isValueCancel()) {
    throw new CollageCancelledError();
  }
  if (!returnCode.isValueSuccess()) {
    const logs = await session.getLogsAsString();
    const fail = await session.getFailStackTrace();
    throw new Error(
      `FFmpeg failed (code ${returnCode.getValue()}): ${fail || logs || 'unknown error'}`,
    );
  }
}

function isPhotoPath(path: string, mediaType: string): boolean {
  if (mediaType === 'photo') {
    return true;
  }
  return /\.(jpe?g|png|webp)$/i.test(path);
}

/**
 * Trim / normalize journal clips, concat to one MP4, optionally mix bundled music (Pro).
 * Writes final file under documentDirectory/collage/ and deletes workdir temps.
 */
export async function assembleCollage(
  clips: CollageClipInput[],
  tier: CollageTier,
  musicPath: string | null,
  options: AssembleCollageOptions = {},
): Promise<string> {
  if (clips.length === 0) {
    throw new Error('No clips to assemble');
  }

  const aspect = options.aspectRatio ?? '16:9';
  const scale = vfScale(tier, aspect);
  const enc = videoEncodeArgs();
  const workDir = new Directory(Paths.cache, `collage_work_${Date.now()}`);
  workDir.create({ intermediates: true, idempotent: true });

  const segmentPaths: string[] = [];

  try {
    for (let i = 0; i < clips.length; i++) {
      options.onPhase?.('trimming');
      const c = clips[i];
      const inPath = stripFileScheme(c.path);
      const segFile = new File(workDir, `seg_${i}.mp4`);
      const segPath = stripFileScheme(segFile.uri);
      segmentPaths.push(segPath);

      const photo = isPhotoPath(inPath, c.mediaType);

      if (photo) {
        await runFfmpeg([
          '-y',
          '-loop',
          '1',
          '-i',
          inPath,
          '-t',
          String(CLIP_SECONDS),
          '-vf',
          scale,
          ...enc,
          '-movflags',
          '+faststart',
          segPath,
        ]);
      } else {
        await runFfmpeg([
          '-y',
          '-i',
          inPath,
          '-t',
          String(CLIP_SECONDS),
          '-vf',
          scale,
          ...enc,
          '-movflags',
          '+faststart',
          segPath,
        ]);
      }
    }

    options.onPhase?.('merging');
    const mergedFile = new File(workDir, 'merged.mp4');
    const mergedPath = stripFileScheme(mergedFile.uri);
    const listFile = new File(workDir, 'concat.txt');
    const listBody = segmentPaths.map(concatListLine).join('\n');
    listFile.write(listBody);

    const listPath = stripFileScheme(listFile.uri);
    const mergeEnc = videoEncodeArgs();
    await runFfmpeg([
      '-y',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      listPath,
      ...mergeEnc,
      '-movflags',
      '+faststart',
      mergedPath,
    ]);

    const outDir = new Directory(Paths.document, 'collage');
    outDir.create({ intermediates: true, idempotent: true });
    const outFile = new File(outDir, `finale_${Date.now()}.mp4`);
    const outPathFs = stripFileScheme(outFile.uri);

    if (musicPath && tier === 'pro') {
      options.onPhase?.('mixing');
      const musicFs = stripFileScheme(musicPath);
      await runFfmpeg([
        '-y',
        '-i',
        mergedPath,
        '-stream_loop',
        '-1',
        '-i',
        musicFs,
        '-map',
        '0:v',
        '-map',
        '1:a',
        '-c:v',
        'copy',
        '-c:a',
        'aac',
        '-b:a',
        '192k',
        '-shortest',
        '-movflags',
        '+faststart',
        outPathFs,
      ]);
    } else {
      await runFfmpeg(['-y', '-i', mergedPath, '-c', 'copy', '-movflags', '+faststart', outPathFs]);
    }

    return outFile.uri;
  } finally {
    try {
      if (workDir.exists) {
        workDir.delete();
      }
    } catch {
      /* best-effort cleanup */
    }
  }
}
