import type { Goal } from '@/models/Goal';

/** Percent of elapsed time from goal start to target (0–100, rounded). */
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

/** Continuous 0–1 fraction from goal start to target, for accent-color interpolation. */
export function accentProgressForGoal(goal: Goal): number {
  const start = goal.startDate.getTime();
  const end = goal.targetDate.getTime();
  const now = Date.now();
  if (end <= start) return 1;
  return Math.min(1, Math.max(0, (now - start) / (end - start)));
}
