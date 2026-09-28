import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type AllTokensState = {
  enabled: boolean;
  guideDismissed: boolean;
  setEnabled: (enabled: boolean) => void;
  dismissGuide: () => void;
};

export const useAllTokensStore = create<AllTokensState>()(
  persist(
    (set) => ({
      enabled: false,
      guideDismissed: false,
      setEnabled: (enabled) => set({ enabled }),
      dismissGuide: () => set({ guideDismissed: true }),
    }),
    {
      name: "stableflow.allTokens",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
