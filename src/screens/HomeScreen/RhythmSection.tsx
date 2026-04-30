import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/AppCard';
import { AppSheet } from '@/components/AppSheet';
import { Body, Caption, Heading } from '@/components/Typography';
import { CompanionCard } from '@/features/ai/components/CompanionCard';
import { useCompanionLine } from '@/features/ai/hooks/useCompanionLine';
import { MOOD_OPTIONS, type MoodTagId } from '@/features/journal/constants/moods';
import {
  BadgeRow,
  EmotionHeatmap,
  ORDERED_BADGE_TYPES,
  useBadgesForGoal,
  useHeatmapDayMoods,
} from '@/features/streak';
import { buildHeatmapGrid, HEATMAP_NUM_WEEKS, HEATMAP_ROWS } from '@/features/streak/logic/heatmapGrid';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type Props = {
  activeGoalId: string;
};

function isKnownMoodTag(id: string): id is MoodTagId {
  return MOOD_OPTIONS.some((m) => m.id === id);
}

function useRhythmWindowStats(dayToMood: Map<string, string>) {
  return useMemo(() => {
    const grid = buildHeatmapGrid();
    let latest: { date: string; mood: string } | null = null;
    let daysLogged = 0;
    for (let c = 0; c < grid.columns; c++) {
      for (let r = 0; r < HEATMAP_ROWS; r++) {
        const { dateIso, isFuture } = grid.getCell(c, r);
        if (isFuture) continue;
        const mood = dayToMood.get(dateIso);
        if (mood && mood.length > 0) {
          daysLogged += 1;
          if (!latest || dateIso > latest.date) {
            latest = { date: dateIso, mood };
          }
        }
      }
    }
    return { latestMood: latest?.mood ?? null, daysLogged };
  }, [dayToMood]);
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    minWidth: 0,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  sheetDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.lg,
  },
});

export function RhythmSection({ activeGoalId }: Props) {
  const { t } = useTranslation();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const companion = useCompanionLine(activeGoalId);
  const showCompanion = companion != null && companion.length > 0;
  const dayToMood = useHeatmapDayMoods(activeGoalId);
  const { earnedIds, isHydrating: badgesHydrating } = useBadgesForGoal(activeGoalId);
  const { latestMood, daysLogged } = useRhythmWindowStats(dayToMood);

  const moodLabel =
    latestMood != null && isKnownMoodTag(latestMood)
      ? t(`moods.${latestMood}`)
      : t('home.insights.noMoodYet');
  const badgesSummary = badgesHydrating ? '…' : `${earnedIds.length}/${ORDERED_BADGE_TYPES.length}`;

  return (
    <>
      <AppCard className="overflow-hidden p-0" testID="home:rhythm:section" accessibilityRole="none">
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm }}>
          <View className="flex-row items-start justify-between gap-2">
            <View className="min-w-0 flex-1">
              <Heading className="mb-0.5 text-lg">{t('home.insights.title')}</Heading>
              <Body className="text-sm text-muted">{t('home.insights.subtitle')}</Body>
            </View>
            <Pressable
              onPress={() => {
                setDetailsOpen(true);
              }}
              accessibilityRole="button"
              accessibilityLabel={t('home.insights.detailsCta')}
              hitSlop={8}
              className="shrink-0 pt-0.5"
            >
              <Caption className="text-xs font-semibold text-accentBlue">{t('home.insights.detailsCta')}</Caption>
            </Pressable>
          </View>
        </View>

        {showCompanion ? (
          <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md, paddingTop: spacing.xs }}>
            <CompanionCard
              activeGoalId={activeGoalId}
              variant="embedded"
              disableFetch
              companionText={companion}
            />
          </View>
        ) : null}

        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
          <Caption className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {t('heatmap.weeksShown', { count: HEATMAP_NUM_WEEKS })}
          </Caption>
          <EmotionHeatmap activeGoalId={activeGoalId} variant="compact" dayMoods={dayToMood} />
        </View>

        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
          <View style={styles.chipRow}>
            <View style={styles.chip} accessibilityRole="text">
              <Caption className="mb-0.5 text-[10px] uppercase tracking-wide text-muted">
                {t('home.insights.chipMood')}
              </Caption>
              <Body className="text-sm font-semibold text-primary" numberOfLines={1}>
                {moodLabel}
              </Body>
            </View>
            <View style={styles.chip} accessibilityRole="text">
              <Caption className="mb-0.5 text-[10px] uppercase tracking-wide text-muted">
                {t('home.insights.chipWindow')}
              </Caption>
              <Body className="text-sm font-semibold text-primary" numberOfLines={1}>
                {t('home.insights.daysLogged', { count: daysLogged })}
              </Body>
            </View>
            <View style={styles.chip} accessibilityRole="text">
              <Caption className="mb-0.5 text-[10px] uppercase tracking-wide text-muted">
                {t('home.insights.chipBadges')}
              </Caption>
              <Body className="text-sm font-semibold text-primary" numberOfLines={1}>
                {badgesSummary}
              </Body>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>
          <BadgeRow activeGoalId={activeGoalId} variant="compact" />
        </View>
      </AppCard>

      <AppSheet
        testID="home:rhythm:sheet"
        visible={detailsOpen}
        snapPoints={['72%', '92%']}
        onDismiss={() => {
          setDetailsOpen(false);
        }}
      >
        <View className="px-lg pb-4xl pt-md">
          <Heading className="mb-1 text-xl">{t('home.insights.title')}</Heading>
          <Body className="mb-4 text-sm text-muted">{t('home.insights.subtitle')}</Body>

          <EmotionHeatmap activeGoalId={activeGoalId} variant="embedded" dayMoods={dayToMood} />

          <View style={styles.sheetDivider} />

          <BadgeRow activeGoalId={activeGoalId} variant="embedded" />
        </View>
      </AppSheet>
    </>
  );
}
