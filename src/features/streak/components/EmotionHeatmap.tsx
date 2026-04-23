import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Body, Heading } from '@/components/Typography';
import { MOOD_OPTIONS, type MoodTagId } from '@/features/journal/constants/moods';

import { heatmapColorForMoodTag, MOOD_HEATMAP_COLORS } from '../constants/moodHeatmapColors';
import { buildHeatmapGrid, HEATMAP_NUM_WEEKS, HEATMAP_ROWS } from '../logic/heatmapGrid';
import { useHeatmapDayMoods } from '../hooks/useHeatmapData';

type Props = {
  activeGoalId: string | null;
};

const CELL = 11;
const GAP = 3;

export function EmotionHeatmap({ activeGoalId }: Props) {
  const { t } = useTranslation();
  const dayToMood = useHeatmapDayMoods(activeGoalId);
  const grid = buildHeatmapGrid();

  if (!activeGoalId) {
    return null;
  }

  return (
    <View
      testID="home:heatmap:root"
      className="rounded-2xl border border-white/10 bg-surface/80 px-4 py-4"
      accessibilityRole="none"
    >
      <Heading className="mb-1 text-lg">{t('heatmap.title')}</Heading>
      <Body className="mb-3 text-sm text-slate-400">{t('heatmap.subtitle')}</Body>

      <View className="flex-row" style={{ gap: GAP }}>
        {Array.from({ length: grid.columns }, (_, col) => (
          <View key={col} className="flex-col" style={{ gap: GAP }}>
            {Array.from({ length: HEATMAP_ROWS }, (_, row) => {
              const { dateIso, isFuture } = grid.getCell(col, row);
              const mood = dayToMood.get(dateIso);
              const bg = isFuture
                ? 'transparent'
                : mood
                  ? heatmapColorForMoodTag(mood)
                  : '#1e293b';
              const border = isFuture ? 'border border-white/5' : '';

              return (
                <View
                  key={`${col}-${row}`}
                  style={{
                    width: CELL,
                    height: CELL,
                    borderRadius: 2,
                    backgroundColor: isFuture ? 'rgba(255,255,255,0.04)' : bg,
                  }}
                  className={border}
                  accessibilityLabel={t('heatmap.cellA11y', {
                    date: dateIso,
                    mood: mood ? t(`moods.${mood as MoodTagId}`) : t('heatmap.noEntry'),
                  })}
                />
              );
            })}
          </View>
        ))}
      </View>

      <View className="mt-4 flex-row flex-wrap gap-x-3 gap-y-2">
        {MOOD_OPTIONS.map((m) => (
          <View key={m.id} className="flex-row items-center gap-1.5">
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: MOOD_HEATMAP_COLORS[m.id],
              }}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />
            <Body className="text-xs text-slate-400">{t(`moods.${m.id}`)}</Body>
          </View>
        ))}
      </View>

      <Body className="mt-2 text-xs text-slate-600">
        {t('heatmap.weeksShown', { count: HEATMAP_NUM_WEEKS })}
      </Body>
    </View>
  );
}
