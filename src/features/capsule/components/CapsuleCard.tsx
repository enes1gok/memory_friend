import { useTranslation } from 'react-i18next';
import { Image, Pressable, View } from 'react-native';

import { Body, Heading } from '@/components/Typography';
import type { Capsule } from '@/models/Capsule';

import { inferMediaKind, isCapsuleViewable } from '../logic/capsuleStatus';
import { CapsuleLockBadge } from './CapsuleLockBadge';

type Props = {
  capsule: Capsule;
  onView: (capsuleId: string) => void;
};

function uriForDisplay(path: string | undefined | null): { uri: string } | null {
  if (!path) return null;
  return { uri: path.startsWith('file://') ? path : `file://${path}` };
}

export function CapsuleCard({ capsule, onView }: Props) {
  const { t, i18n } = useTranslation();
  const viewable = isCapsuleViewable(capsule);
  const isLocked = !viewable;
  const mediaKind = inferMediaKind(capsule.mediaPath);
  const previewUri = uriForDisplay(capsule.mediaPath);
  const dateStr = new Date(capsule.unlocksAt).toLocaleDateString(i18n.language, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const stateText = isLocked
    ? t('capsule.card.lockedStatus')
    : t('capsule.card.unlockedStatus');

  return (
    <View
      testID="capsule:card:root"
      className="mb-3 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60"
    >
      <View className="p-3">
        <View className="mb-2 flex-row items-start justify-between gap-2">
          <View className="min-w-0 flex-1">
            <Heading className="text-lg" numberOfLines={2} accessibilityRole="header">
              {capsule.title}
            </Heading>
            <Body className="mt-1 text-slate-500" testID="capsule:card:date">
              {t('capsule.card.opensOn', { date: dateStr })}
            </Body>
          </View>
          <CapsuleLockBadge isLocked={isLocked} />
        </View>

        {viewable && mediaKind === 'photo' && previewUri ? (
          <Image
            source={previewUri}
            className="mb-3 h-32 w-full rounded-xl bg-slate-800"
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : null}

        {viewable && !previewUri && capsule.text ? (
          <Body className="mb-3 text-slate-300" numberOfLines={3}>
            {capsule.text}
          </Body>
        ) : null}
      </View>

      {viewable ? (
        <Pressable
          testID="capsule:card:view"
          onPress={() => {
            onView(capsule.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={t('capsule.card.a11y', {
            title: capsule.title,
            state: stateText,
          })}
          className="border-t border-white/10 bg-white/5 py-3"
        >
          <Body className="text-center font-semibold text-blue-400">{t('capsule.card.viewCta')}</Body>
        </Pressable>
      ) : null}
    </View>
  );
}
