import { Q } from '@nozbe/watermelondb';
import { useDatabase } from '@nozbe/watermelondb/react';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Image, Modal, View, useWindowDimensions } from 'react-native';

import { PrimaryButton } from '@/components/PrimaryButton';
import { Body, Heading } from '@/components/Typography';
import { colors } from '@/theme/colors';
import type { JournalEntry } from '@/models/JournalEntry';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  activeGoalId: string | null;
};

function mediaUri(path?: string): string | undefined {
  if (!path) return undefined;
  return path.startsWith('file://') ? path : `file://${path}`;
}

const UPLIFT_MOODS = new Set(['happy', 'excited']);

/**
 * Full-screen “hype” moment with up to 3 recent uplifting journal thumbnails.
 */
export function HypeManModal({ visible, onDismiss, activeGoalId }: Props) {
  const { t } = useTranslation();
  const database = useDatabase();
  const { height } = useWindowDimensions();
  const [uris, setUris] = useState<string[]>([]);

  useEffect(() => {
    if (!visible || !activeGoalId) {
      return;
    }
    let alive = true;
    void (async () => {
      const entries = await database
        .get<JournalEntry>('journal_entries')
        .query(Q.where('goal_id', activeGoalId), Q.sortBy('captured_at', Q.desc))
        .fetch();
      const withPhoto = entries.filter(
        (e) => e.mediaType === 'photo' && e.mediaPath && UPLIFT_MOODS.has(e.moodTag),
      );
      const out = withPhoto
        .slice(0, 3)
        .map((e) => mediaUri(e.mediaPath))
        .filter((u): u is string => u != null);
      if (alive) {
        setUris(out);
      }
    })();
    return () => {
      alive = false;
    };
  }, [activeGoalId, database, visible]);

  return (
    <Modal
      testID="home:hype:man:modal"
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onDismiss}
    >
      <View
        className="flex-1 justify-between px-4 pt-14 pb-10"
        style={{ backgroundColor: colors.canvas, minHeight: height }}
      >
        <View>
          <Heading className="mb-2 text-2xl">{t('ai.hypeMan.title')}</Heading>
          <Body className="text-secondary">{t('ai.hypeMan.subtitle')}</Body>
        </View>
        {uris.length > 0 ? (
          <View className="mt-4 flex-row flex-wrap justify-center gap-3">
            {uris.map((uri) => (
              <View
                key={uri}
                className="h-36 w-[30%] min-w-[100px] overflow-hidden rounded-2xl border border-white/10"
              >
                <Image source={{ uri }} className="h-full w-full" resizeMode="cover" />
              </View>
            ))}
          </View>
        ) : (
          <View className="mt-6 items-center">
            <Body className="text-center text-muted">{t('ai.hypeMan.noPhotos')}</Body>
          </View>
        )}

        <PrimaryButton
          onPress={onDismiss}
          accessibilityLabel={t('ai.hypeMan.dismissA11y')}
          className="mt-4"
          gradient
          variant="orange"
        >
          {t('ai.hypeMan.cta')}
        </PrimaryButton>
      </View>
    </Modal>
  );
}
