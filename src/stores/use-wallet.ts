import { create } from "zustand/index";
import { usdt } from "@/config/tokens/usdt";

interface WalletState {
  showWallet: boolean;
  usdcExpand: boolean;
  usdtExpand: boolean;
  fromToken: any;
  toToken: any;
  isTo: boolean;
  set: (params: any) => void;
}

const useWalletStore = create<WalletState>((set) => ({
  showWallet: false,
  usdcExpand: false,
  usdtExpand: false,
  fromToken: usdt,
  toToken: null,
  isTo: false,
  set: (params) => set(() => ({ ...params }))
}));

export default useWalletStore;
