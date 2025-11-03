import { create } from "zustand/index";

interface PricesState {
  prices: Record<string, string>;
  set: (params: any) => void;
}

const usePricesStore = create<PricesState>((set) => ({
  prices: {},
  set: (params) => set(() => ({ ...params })),
}));

export default usePricesStore;
