import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface ConfigState {
  config: any;
  set: (params: any) => void;
}

export const useConfigStore = create(
  persist<ConfigState>(
    (set) => ({
      config: null,
      set: (params) => set(() => ({ ...params }))
    }),
    {
      name: "_config",
      version: 0.1,
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
