/** Time capsule — create, lock/unlock, delivery notification (Phase 6). */

export { CapsuleCard } from './components/CapsuleCard';
export { CapsuleLockBadge } from './components/CapsuleLockBadge';
export { useCapsulesByGoal } from './hooks/useCapsulesByGoal';
export { useCreateCapsule } from './hooks/useCreateCapsule';
export { useUnlockCapsule } from './hooks/useUnlockCapsule';
export {
  type CreateCapsuleInput,
  createCapsule,
} from './logic/createCapsule';
export {
  daysUntilUnlock,
  inferMediaKind,
  isCapsuleContentValid,
  isCapsuleViewable,
  isUnlockDateInTheFuture,
} from './logic/capsuleStatus';
export { unlockDueCapsulesForGoal, unlockCapsuleId } from './logic/unlockCapsule';
