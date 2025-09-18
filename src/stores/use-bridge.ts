import { create } from "zustand/index";

interface BridgeState {
  amount: string;
  recipientAddress: string;
  quoteData: any;
  quoting: boolean;
  transferring: boolean;
  errorTips: string;
  showFee: boolean;
  set: (params: any) => void;
}

const useBridgeStore = create<BridgeState>((set) => ({
  amount: "",
  recipientAddress: "",
  quoteData: null,
  quoting: false,
  transferring: false,
  errorTips: "",
  showFee: false,
  set: (params) => set(() => ({ ...params }))
}));

export default useBridgeStore;
