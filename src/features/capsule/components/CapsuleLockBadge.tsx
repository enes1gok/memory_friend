import { useTranslation } from 'react-i18next';
import { IconChip } from '@/components/IconChip';
import { colors } from '@/theme/colors';

type Props = {
  /** True when the capsule is still sealed (before open date). */
  isLocked: boolean;
};

export function CapsuleLockBadge({ isLocked }: Props) {
  const { t } = useTranslation();
  return (
    <IconChip
      testID="capsule:badge:status"
      icon={isLocked ? 'lock-closed-outline' : 'lock-open-outline'}
      label={isLocked ? t('capsule.card.lockedStatus') : t('capsule.card.unlockedStatus')}
      tone={isLocked ? colors.accentOrange : colors.success}
    />
  );
}
