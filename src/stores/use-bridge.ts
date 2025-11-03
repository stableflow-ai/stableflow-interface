import { create } from "zustand/index";
import type { ServiceType } from "@/services";

interface BridgeState {
  amount: string;
  recipientAddress: string;
  quoteData: any;
  quoteDataMap: Map<string, any>;
  quoting: boolean;
  quotingMap: Map<string, boolean>;
  transferring: boolean;
  errorTips: string;
  showFee: boolean;
  set: (params: any) => void;
  setQuoteData: (key: string, value: any) => void;
  setQuoting: (key: string, value: boolean) => void;
}

const useBridgeStore = create<BridgeState>((set) => ({
  amount: "",
  recipientAddress: "",
  quoteData: null,
  quoteDataMap: new Map(),
  quoting: false,
  quotingMap: new Map(),
  transferring: false,
  errorTips: "",
  showFee: false,
  set: (params) => set(() => ({ ...params })),
  setQuoteData: (key, value) => {
    set((state) => {
      state.quoteDataMap.set(key, value);
      return state;
    });
  },
  setQuoting: (key, value) => {
    set((state) => {
      state.quotingMap.set(key, value);
      return state;
    });
  },
}));

export default useBridgeStore;


export interface QuoteData {
  type: ServiceType;
  errMsg?: string;
  data?: any;
}
