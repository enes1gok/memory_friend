/**
 * A capsule is viewable when explicitly unlocked in DB, or the unlock time has passed
 * and the row should be reconciled to unlocked (handled in hooks / unlock helper).
 */
export function isCapsuleViewable(
  capsule: { isUnlocked: boolean; unlocksAt: Date },
  now: Date = new Date(),
): boolean {
  return capsule.isUnlocked || capsule.unlocksAt.getTime() <= now.getTime();
}

/** Calendar-day difference until unlock; 0 = unlock day or past. */
export function daysUntilUnlock(unlocksAt: Date, now: Date = new Date()): number {
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const b = new Date(unlocksAt.getFullYear(), unlocksAt.getMonth(), unlocksAt.getDate());
  return Math.max(0, Math.ceil((b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000)));
}

export function inferMediaKind(
  mediaPath: string | undefined,
): 'video' | 'photo' | 'none' {
  if (!mediaPath) {
    return 'none';
  }
  const lower = mediaPath.toLowerCase();
  if (lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.m4v')) {
    return 'video';
  }
  if (
    lower.endsWith('.jpg') ||
    lower.endsWith('.jpeg') ||
    lower.endsWith('.png') ||
    lower.endsWith('.webp')
  ) {
    return 'photo';
  }
  return 'video';
}

export function isCapsuleContentValid(input: {
  title: string;
  mediaPath?: string;
  text?: string;
}): boolean {
  return (
    input.title.trim().length > 0 && Boolean(input.mediaPath?.trim() || input.text?.trim())
  );
}

export function isUnlockDateInTheFuture(
  unlocksAt: Date,
  now: Date = new Date(),
): boolean {
  return unlocksAt.getTime() > now.getTime();
}
