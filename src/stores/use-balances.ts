import { create } from "zustand/index";

export interface BalancesState {
  evmBalances: any;
  solBalances: any;
  nearBalances: any;
  set: (params: any) => void;
}

const useBalancesStore = create<BalancesState>((set) => ({
  evmBalances: {},
  solBalances: {},
  nearBalances: {},
  tronBalances: {},
  set: (params) => set(() => ({ ...params }))
}));

export default useBalancesStore;
