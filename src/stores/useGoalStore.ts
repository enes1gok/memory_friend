import { create } from 'zustand';

import { storage } from '@/utils/mmkv';
import { MMKV_KEYS } from '@/utils/mmkvKeys';

function readActiveGoalId(): string | null {
  const id = storage.getString(MMKV_KEYS.activeGoalId);
  return id ?? null;
}

interface GoalState {
  activeGoalId: string | null;
  setActiveGoalId: (id: string | null) => void;
}

export const useGoalStore = create<GoalState>((set) => ({
  activeGoalId: readActiveGoalId(),
  setActiveGoalId: (id) => {
    if (id === null || id === '') {
      storage.remove(MMKV_KEYS.activeGoalId);
      set({ activeGoalId: null });
      return;
    }
    storage.set(MMKV_KEYS.activeGoalId, id);
    set({ activeGoalId: id });
  },
}));
