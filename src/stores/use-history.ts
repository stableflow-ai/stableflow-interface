import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface HistoryState {
  history: any[];
  set: (params: any) => void;
}

export const useConfigStore = create(
  persist<HistoryState>(
    (set) => ({
      history: [],
      set: (params) => set(() => ({ ...params }))
    }),
    {
      name: "_history",
      version: 0.1,
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
