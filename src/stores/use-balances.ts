import { create } from "zustand/index";
import { createJSONStorage, persist } from "zustand/middleware";

export interface BalancesState {
  evmBalances: any;
  solBalances: any;
  nearBalances: any;
  tronBalances: any;
  set: (params: any) => void;
}

export const useBalancesStore = create(
  persist<BalancesState>(
    (set) => ({
      evmBalances: {},
      solBalances: {},
      nearBalances: {},
      tronBalances: {},
      set: (params) => set(() => ({ ...params }))
    }),
    {
      name: "_balances",
      version: 0.1,
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);

export default useBalancesStore;
