import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ConfigState {
  slippage: number;
  tronWalletAdapter: string | null;
  set: (params: any) => void;
}

export const useConfigStore = create(
  persist<ConfigState>(
    (set) => ({
      slippage: 0.05,
      tronWalletAdapter: null,
      set: (params) => set(() => ({ ...params }))
    }),
    {
      name: "_config",
      version: 0.11,
      storage: createJSONStorage(() => localStorage)
    }
  )
);
