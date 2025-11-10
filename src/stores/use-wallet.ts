import { create } from "zustand/index";
import { createJSONStorage, persist } from "zustand/middleware";
import { usdt } from "@/config/tokens/usdt";

interface WalletState {
  showWallet: boolean;
  usdtExpand: boolean;
  selectedToken: "USDT" | "USDC";
  fromToken: any;
  toToken: any;
  isTo: boolean;
  set: (params: any) => void;
}

const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      showWallet: false,
      usdtExpand: false,
      selectedToken: "USDT",
      fromToken: usdt,
      toToken: null,
      isTo: false,
      set: (params) => set(() => ({ ...params }))
    }),
    {
      name: "_wallet",
      version: 0.1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        usdtExpand: state.usdtExpand,
        selectedToken: state.selectedToken
      })
    }
  )
);

export default useWalletStore;
