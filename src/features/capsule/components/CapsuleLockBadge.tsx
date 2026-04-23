import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Body } from '@/components/Typography';

type Props = {
  /** True when the capsule is still sealed (before open date). */
  isLocked: boolean;
};

export function CapsuleLockBadge({ isLocked }: Props) {
  const { t } = useTranslation();
  return (
    <View
      testID="capsule:badge:status"
      className="self-start rounded-full bg-white/10 px-2.5 py-1"
    >
      <Body className="text-xs font-medium text-slate-300">
        {isLocked ? t('capsule.card.lockedStatus') : t('capsule.card.unlockedStatus')}
      </Body>
    </View>
  );
}
