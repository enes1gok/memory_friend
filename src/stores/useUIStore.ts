import { create } from 'zustand';

export type ThemePreference = 'dark' | 'light';

/** Window coordinates (pt) of the center of the Journal tab icon. */
export type JournalTabAnchor = { x: number; y: number };

/** One-shot fly animation from quick-add save toward the Journal tab. */
export type JournalFlyRequest = {
  fromX: number;
  fromY: number;
  runId: number;
  tint: string;
};

interface UIState {
  /** 0 = goal far (blue accent), 1 = goal near (orange accent). */
  accentProgress: number;
  setAccentProgress: (progress: number) => void;
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  /** Set when a badge celebration ends on Capture; Home shows Hype Man once. */
  hypeManFromCapturePending: boolean;
  setHypeManFromCapturePending: (pending: boolean) => void;
  /** Updated by AppTabBar when the Journal tab button lays out. */
  journalTabAnchor: JournalTabAnchor | null;
  setJournalTabAnchor: (anchor: JournalTabAnchor | null) => void;
  /** Incrementing id so overlapping saves do not reuse stale animation state. */
  flyRunId: number;
  journalFlyRequest: JournalFlyRequest | null;
  requestJournalFly: (args: { fromX: number; fromY: number; tint: string }) => void;
  clearJournalFlyRequest: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  accentProgress: 0,
  setAccentProgress: (accentProgress) => set({ accentProgress }),
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
  hypeManFromCapturePending: false,
  setHypeManFromCapturePending: (hypeManFromCapturePending) => set({ hypeManFromCapturePending }),
  journalTabAnchor: null,
  setJournalTabAnchor: (journalTabAnchor) => set({ journalTabAnchor }),
  flyRunId: 0,
  journalFlyRequest: null,
  requestJournalFly: ({ fromX, fromY, tint }) => {
    const next = get().flyRunId + 1;
    set({
      flyRunId: next,
      journalFlyRequest: { fromX, fromY, runId: next, tint },
    });
  },
  clearJournalFlyRequest: () => set({ journalFlyRequest: null }),
}));
