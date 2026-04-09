import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

const TRACK_STORAGE_KEY = "stableflow_track_store";

interface TrackState {
  sessionId: string | null;
  initSessionId: () => void;
  clearSessionId: () => void;
}

export const useTrackStore = create(persist<TrackState>(
  (set, get) => ({
    sessionId: null,
    initSessionId: () => set(() => ({ sessionId: uuidv4() })),
    clearSessionId: () => set(() => ({ sessionId: null })),
  }),
  {
    name: TRACK_STORAGE_KEY,
    version: 0.1,
    storage: createJSONStorage(() => sessionStorage),
    partialize: (state) => ({ sessionId: state.sessionId }) as any,
  },
));
