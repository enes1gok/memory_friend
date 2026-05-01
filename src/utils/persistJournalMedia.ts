import { Directory, File, Paths } from 'expo-file-system';

/** Copy media into the app document directory. Returns persisted `file://` URI. */
export function persistJournalMedia(sourcePath: string, ext: 'mp4' | 'jpg' | 'm4a'): string {
  const normalizedSource = sourcePath.startsWith('file://') ? sourcePath : `file://${sourcePath}`;
  const journalDir = new Directory(Paths.document, 'journal');
  journalDir.create({ intermediates: true, idempotent: true });
  const destFile = new File(journalDir, `capture_${Date.now()}.${ext}`);
  const srcFile = new File(normalizedSource);
  srcFile.copy(destFile);
  return destFile.uri;
}
