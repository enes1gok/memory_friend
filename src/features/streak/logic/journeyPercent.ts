import type { Goal } from '@/models/Goal';

/** Percent of elapsed time from goal start to target (0–100). */
export function journeyPercent(goal: Goal): number {
  const start = goal.startDate.getTime();
  const end = goal.targetDate.getTime();
  const now = Date.now();
  if (end <= start) {
    return 100;
  }
  const t = (now - start) / (end - start);
  return Math.min(100, Math.max(0, Math.round(t * 100)));
}
