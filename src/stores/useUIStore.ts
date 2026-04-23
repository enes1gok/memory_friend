import { create } from 'zustand';

export type ThemePreference = 'dark' | 'light';

interface UIState {
  /** 0 = goal far (blue accent), 1 = goal near (orange accent). */
  accentProgress: number;
  setAccentProgress: (progress: number) => void;
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  /** Set when a badge celebration ends on Capture; Home shows Hype Man once. */
  hypeManFromCapturePending: boolean;
  setHypeManFromCapturePending: (pending: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  accentProgress: 0,
  setAccentProgress: (accentProgress) => set({ accentProgress }),
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  hypeManFromCapturePending: false,
  setHypeManFromCapturePending: (hypeManFromCapturePending) => set({ hypeManFromCapturePending }),
}));
