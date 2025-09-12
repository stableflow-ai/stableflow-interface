import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ConfigState {
  slippage: number;
  set: (params: any) => void;
}

export const useConfigStore = create(
  persist<ConfigState>(
    (set) => ({
      slippage: 1,
      set: (params) => set(() => ({ ...params }))
    }),
    {
      name: "_config",
      version: 0.1,
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
