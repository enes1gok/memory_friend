import * as FileSystem from 'expo-file-system';
const MAX_BYTES = 25 * 1024 * 1024;
const WARN_BYTES = 20 * 1024 * 1024;

function toFileUri(path: string): string {
  if (path.startsWith('file://')) {
    return path;
  }
  return `file://${path}`;
}

/** Filename + MIME for Whisper multipart upload (must match file contents). */
function whisperFilePart(localPath: string): { name: string; type: string } {
  const lower = localPath.toLowerCase();
  if (lower.endsWith('.m4a')) {
    return { name: 'audio.m4a', type: 'audio/mp4' };
  }
  if (lower.endsWith('.caf')) {
    return { name: 'audio.caf', type: 'audio/x-caf' };
  }
  if (lower.endsWith('.mp4') || lower.endsWith('.mov')) {
    return { name: 'capture.mp4', type: 'video/mp4' };
  }
  return { name: 'capture.mp4', type: 'video/mp4' };
}

/**
 * Whisper transcription for a local media file (e.g. MP4 from VisionCamera, M4A voice note).
 * Returns `null` on any failure — never throws to callers.
 */
export async function transcribeAudio(localPath: string): Promise<string | null> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const uri = toFileUri(localPath);
  try {
    const info = await FileSystem.getInfoAsync(uri);
    if (!info.exists) {
      console.warn('[transcribeAudio] file missing', localPath);
      return null;
    }
    if ('size' in info && typeof info.size === 'number') {
      if (info.size > MAX_BYTES) {
        console.warn('[transcribeAudio] file too large for Whisper', info.size);
        return null;
      }
      if (info.size > WARN_BYTES) {
        console.warn('[transcribeAudio] large file; may be slow', info.size);
      }
    }
  } catch (e) {
    console.warn('[transcribeAudio] stat failed', e);
    return null;
  }

  const { name, type } = whisperFilePart(localPath);

  try {
    const form = new FormData();
    form.append('model', 'whisper-1');
    form.append('file', {
      uri,
      name,
      type,
    } as unknown as Blob);

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      console.warn('[transcribeAudio] API error', res.status, errText);
      return null;
    }

    const data: unknown = await res.json();
    if (typeof data === 'object' && data !== null && 'text' in data && typeof (data as { text: unknown }).text === 'string') {
      const text = (data as { text: string }).text.trim();
      return text.length > 0 ? text : null;
    }
    return null;
  } catch (e) {
    console.warn('[transcribeAudio] request failed', e);
    return null;
  }
}
