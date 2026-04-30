/** Streak engine, badges, heatmap (Phase 4). */

export { BADGE_DISPLAY, BADGE_TYPES, ORDERED_BADGE_TYPES } from './constants/badgeTypes';
export type { BadgeDisplay, BadgeTypeId } from './constants/badgeTypes';
export { MOOD_HEATMAP_COLORS, heatmapColorForMoodTag } from './constants/moodHeatmapColors';

export { BadgeRow } from './components/BadgeRow';
export { CelebrationOverlay } from './components/CelebrationOverlay';
export { EmotionHeatmap } from './components/EmotionHeatmap';
export { JourneyProgressCard } from './components/JourneyProgressCard';
export { StreakCounter } from './components/StreakCounter';

export { useActiveGoal } from './hooks/useActiveGoal';
export { useBadgesForGoal } from './hooks/useBadgesForGoal';
export { useHeatmapDayMoods } from './hooks/useHeatmapData';
export { useStreakState } from './hooks/useStreakState';
export type { StreakViewModel } from './hooks/useStreakState';
export { useUpdateStreak } from './hooks/useUpdateStreak';

export { getNewBadgesToAward } from './logic/badgeRules';
export {
  computeStreakAfterNewEntry,
  getCalendarDaysDiff,
  todayIsoLocal,
  type StreakSnapshot,
} from './logic/computeStreak';
export { pickBestNewBadge } from './logic/pickBestNewBadge';
export { updateStreakAfterJournalWrite } from './logic/updateStreakAfterJournalWrite';
