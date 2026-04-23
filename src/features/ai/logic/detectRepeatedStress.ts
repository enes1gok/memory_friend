const NEGATIVE = new Set(['stressed', 'exhausted']);
const CONSEC = 3;

export type EmotionRow = { emotionTags: string[] };

/**
 * @param rows — in **chronological order** (oldest → newest) for the last check-ins, including entries with no tags yet.
 */
export function detectRepeatedStress(rows: EmotionRow[]): { triggered: boolean; pattern: string } {
  if (rows.length < CONSEC) {
    return { triggered: false, pattern: 'none' };
  }

  const tail = rows.slice(-CONSEC);
  for (const r of tail) {
    const tags = r.emotionTags;
    const hasNeg = tags.some((t) => NEGATIVE.has(t.toLowerCase()));
    if (!hasNeg) {
      return { triggered: false, pattern: 'none' };
    }
  }
  return { triggered: true, pattern: 'stressed_streak' };
}
