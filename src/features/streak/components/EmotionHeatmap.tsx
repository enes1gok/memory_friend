import { useTranslation } from 'react-i18next';
import { ScrollView, View, useWindowDimensions } from 'react-native';

import { AppCard } from '@/components/AppCard';
import { Body, Caption, Heading } from '@/components/Typography';
import { MOOD_OPTIONS, type MoodTagId } from '@/features/journal/constants/moods';
import { spacing } from '@/theme/spacing';

import { heatmapColorForMoodTag, MOOD_HEATMAP_COLORS } from '../constants/moodHeatmapColors';
import { buildHeatmapGrid, HEATMAP_NUM_WEEKS, HEATMAP_ROWS } from '../logic/heatmapGrid';
import { useHeatmapDayMoods } from '../hooks/useHeatmapData';

type Props = {
  activeGoalId: string | null;
  variant?: 'card' | 'embedded' | 'compact';
  /** When set, skips internal subscription (parent shares `useHeatmapDayMoods`). */
  dayMoods?: Map<string, string>;
};

const CELL_GAP = 3;
const MIN_CELL = 9;
const MIN_CELL_COMPACT = 8;
const MAX_CELL_COMPACT = 10;

/** Horizontal inset from screen edge to heatmap grid (scroll padding + card padding). */
const HEATMAP_SCREEN_INSET = spacing.xl * 2 + spacing.lg * 2;

export function EmotionHeatmap({ activeGoalId, variant = 'card', dayMoods: dayMoodsProp }: Props) {
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const internalMap = useHeatmapDayMoods(dayMoodsProp != null ? null : activeGoalId);
  const dayToMood = dayMoodsProp ?? internalMap;
  const grid = buildHeatmapGrid();

  if (!activeGoalId) {
    return null;
  }

  const available = Math.max(200, windowWidth - HEATMAP_SCREEN_INSET);
  const rawCell = Math.floor(
    (available - (HEATMAP_NUM_WEEKS - 1) * CELL_GAP) / HEATMAP_NUM_WEEKS,
  );
  const minCell = variant === 'compact' ? MIN_CELL_COMPACT : MIN_CELL;
  const maxCell = variant === 'compact' ? MAX_CELL_COMPACT : 12;
  const cell = Math.max(minCell, Math.min(maxCell, rawCell));

  const titleRow = (
    <View className="mb-1 flex-row items-baseline justify-between gap-2">
      <Heading
        className={`shrink ${variant === 'embedded' ? 'text-base font-semibold' : 'text-lg'}`}
        numberOfLines={1}
      >
        {t('heatmap.title')}
      </Heading>
      <Caption className="shrink-0 text-xs text-muted" numberOfLines={1}>
        {t('heatmap.weeksShown', { count: HEATMAP_NUM_WEEKS })}
      </Caption>
    </View>
  );

  const subtitle = (
    <Body className={`text-muted ${variant === 'embedded' ? 'mb-2 text-xs' : 'mb-3 text-sm'}`}>
      {t('heatmap.subtitle')}
    </Body>
  );

  const gridScroll = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        flexDirection: 'row',
        paddingVertical: variant === 'compact' ? 2 : 4,
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
                  borderRadius: variant === 'compact' || variant === 'embedded' ? 4 : 2,
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
  );

  const legend = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={variant === 'embedded' ? 'mt-2' : 'mt-4'}
      contentContainerStyle={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 2,
      }}
      accessibilityRole="none"
    >
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
    </ScrollView>
  );

  if (variant === 'compact') {
    return (
      <View testID="home:heatmap:root" accessibilityRole="none">
        {gridScroll}
      </View>
    );
  }

  const inner = (
    <>
      {titleRow}
      {subtitle}
      {gridScroll}
      {legend}
    </>
  );

  if (variant === 'embedded') {
    return (
      <View testID="home:heatmap:root" accessibilityRole="none">
        {inner}
      </View>
    );
  }

  return (
    <AppCard testID="home:heatmap:root" accessibilityRole="none">
      {inner}
    </AppCard>
  );
}
