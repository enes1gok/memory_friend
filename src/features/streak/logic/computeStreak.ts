/**
 * Pure calendar-date helpers for streak computation (local timezone).
 * Uses ISO date strings YYYY-MM-DD (e.g. from `toLocaleDateString('en-CA')`).
 */

export type StreakSnapshot = {
  currentStreak: number;
  longestStreak: number;
  lastCheckInDate?: string;
  totalEntries: number;
};

function parseIsoLocal(iso: string): Date {
  const parts = iso.split('-').map(Number);
  const y = parts[0] ?? 0;
  const m = parts[1] ?? 1;
  const d = parts[2] ?? 1;
  return new Date(y, m - 1, d);
}

/** Calendar days from `earlierIso` to `laterIso` (non-negative when later >= earlier). */
export function getCalendarDaysDiff(earlierIso: string, laterIso: string): number {
  const a = parseIsoLocal(earlierIso);
  const b = parseIsoLocal(laterIso);
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

export function todayIsoLocal(d: Date = new Date()): string {
  return d.toLocaleDateString('en-CA');
}

/**
 * Applies one new journal entry to streak state.
 * Rules: same local day only bumps totalEntries; yesterday extends chain; gap resets to 1.
 */
export function computeStreakAfterNewEntry(
  prev: StreakSnapshot,
  todayIso: string,
): StreakSnapshot {
  const { currentStreak, longestStreak, lastCheckInDate, totalEntries } = prev;
  const nextTotal = totalEntries + 1;

  if (!lastCheckInDate) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(longestStreak, 1),
      lastCheckInDate: todayIso,
      totalEntries: nextTotal,
    };
  }

  if (lastCheckInDate === todayIso) {
    return {
      currentStreak,
      longestStreak,
      lastCheckInDate,
      totalEntries: nextTotal,
    };
  }

  const diff = getCalendarDaysDiff(lastCheckInDate, todayIso);
  if (diff === 1) {
    const nextStreak = currentStreak + 1;
    return {
      currentStreak: nextStreak,
      longestStreak: Math.max(longestStreak, nextStreak),
      lastCheckInDate: todayIso,
      totalEntries: nextTotal,
    };
  }

  return {
    currentStreak: 1,
    longestStreak: Math.max(longestStreak, 1),
    lastCheckInDate: todayIso,
    totalEntries: nextTotal,
  };
}
