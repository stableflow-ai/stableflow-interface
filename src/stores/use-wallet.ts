import { create } from "zustand/index";

interface WalletState {
  showWallet: boolean;
  usdcExpand: boolean;
  usdtExpand: boolean;
  fromToken: any;
  toToken: any;
  set: (params: any) => void;
}

const useWalletStore = create<WalletState>((set) => ({
  showWallet: false,
  usdcExpand: false,
  usdtExpand: false,
  fromToken: null,
  toToken: null,
  set: (params) => set(() => ({ ...params }))
}));

export default useWalletStore;
