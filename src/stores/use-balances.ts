import { create } from "zustand/index";

interface BalancesState {
  balances: any;
  set: (params: any) => void;
}

const useBalancesStore = create<BalancesState>((set) => ({
  balances: {},
  set: (params) => set(() => ({ ...params }))
}));

export default useBalancesStore;
