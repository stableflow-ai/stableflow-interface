import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const TRACK_STORAGE_KEY = "stableflow_track_store";

interface TrackState {
  sessionId: string | null;
  initSessionId: (sessionId: string) => void;
  clearSessionId: () => void;
}

export const useTrackStore = create(persist<TrackState>(
  (set, get) => ({
    sessionId: null,
    initSessionId: (sessionId) => set(() => ({ sessionId })),
    clearSessionId: () => set(() => ({ sessionId: null })),
  }),
  {
    name: TRACK_STORAGE_KEY,
    version: 0.1,
    storage: createJSONStorage(() => sessionStorage),
    partialize: (state) => ({ sessionId: state.sessionId }) as any,
  },
));
