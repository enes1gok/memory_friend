import { useTranslation } from 'react-i18next';
import { ScrollView, View, useWindowDimensions } from 'react-native';

import { AppCard } from '@/components/AppCard';
import { Body, Caption, Heading } from '@/components/Typography';
import { MOOD_OPTIONS, type MoodTagId } from '@/features/journal/constants/moods';

import { heatmapColorForMoodTag, MOOD_HEATMAP_COLORS } from '../constants/moodHeatmapColors';
import { buildHeatmapGrid, HEATMAP_NUM_WEEKS, HEATMAP_ROWS } from '../logic/heatmapGrid';
import { useHeatmapDayMoods } from '../hooks/useHeatmapData';

type Props = {
  activeGoalId: string | null;
};

const CELL_GAP = 3;
const MIN_CELL = 9;

export function EmotionHeatmap({ activeGoalId }: Props) {
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const dayToMood = useHeatmapDayMoods(activeGoalId);
  const grid = buildHeatmapGrid();

  if (!activeGoalId) {
    return null;
  }

  /** Screen horizontal padding (px-4) + card padding */
  const horizontalMargin = 32 + 32;
  const available = Math.max(200, windowWidth - horizontalMargin);
  const rawCell = Math.floor(
    (available - (HEATMAP_NUM_WEEKS - 1) * CELL_GAP) / HEATMAP_NUM_WEEKS,
  );
  const cell = Math.max(MIN_CELL, Math.min(12, rawCell));

  return (
    <AppCard testID="home:heatmap:root" accessibilityRole="none">
      <Heading className="mb-1 text-lg">{t('heatmap.title')}</Heading>
      <Body className="mb-3 text-sm text-muted">{t('heatmap.subtitle')}</Body>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          flexDirection: 'row',
          paddingVertical: 4,
        }}
        accessibilityRole="none"
      >
        {Array.from({ length: grid.columns }, (_, col) => (
          <View
            key={col}
            style={{
              width: cell,
              marginRight: col < grid.columns - 1 ? CELL_GAP : 0,
              flexDirection: 'column',
            }}
          >
            {Array.from({ length: HEATMAP_ROWS }, (_, row) => {
              const { dateIso, isFuture } = grid.getCell(col, row);
              const mood = dayToMood.get(dateIso);
              const bg = isFuture
                ? 'transparent'
                : mood
                  ? heatmapColorForMoodTag(mood)
                  : '#1e293b';

              return (
                <View
                  key={`${col}-${row}`}
                  style={{
                    width: cell,
                    height: cell,
                    marginBottom: row < HEATMAP_ROWS - 1 ? CELL_GAP : 0,
                    borderRadius: 2,
                    backgroundColor: isFuture ? 'rgba(255,255,255,0.06)' : bg,
                    borderWidth: isFuture ? 1 : 0,
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                  accessibilityLabel={t('heatmap.cellA11y', {
                    date: dateIso,
                    mood: mood ? t(`moods.${mood as MoodTagId}`) : t('heatmap.noEntry'),
                  })}
                />
              );
            })}
          </View>
        ))}
      </ScrollView>

      <View className="mt-4 flex-row flex-wrap" style={{ gap: 10 }}>
        {MOOD_OPTIONS.map((m) => (
          <View key={m.id} className="flex-row items-center" style={{ gap: 6 }}>
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
            <Caption className="text-xs text-muted">{t(`moods.${m.id}`)}</Caption>
          </View>
        ))}
      </View>

      <Caption className="mt-3 text-xs opacity-80">
        {t('heatmap.weeksShown', { count: HEATMAP_NUM_WEEKS })}
      </Caption>
    </AppCard>
  );
}
