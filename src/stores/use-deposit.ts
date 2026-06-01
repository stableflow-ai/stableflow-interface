import type { TokenChain } from "@/config/chains";
import {
  findDepositTokenChain,
  getFirstDepositTokenChain,
  isValidDepositSelection,
} from "@/sections/wallet/deposit/config";
import { usdtChains } from "@/config/tokens/usdt";
import useWalletStore from "@/stores/use-wallet";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type DepositStep = "form" | "qrcode";

interface DepositState {
  visible: boolean;
  step: DepositStep;
  token?: TokenChain | null;
  network?: string | null;
  recipientAddress: string;
  setVisible: (visible: boolean) => void;
  setStep: (step: DepositStep) => void;
  setRecipientAddress: (address: string) => void;
  setToken: (token: TokenChain) => void;
  setTokenBySymbol: (symbol: string) => void;
  setNetwork: (network: string) => void;
  setTokenAndNetwork: (token: TokenChain, network: string) => void;
  openModal: () => void;
  closeModal: () => void;
  reset: () => void;
}

export const useDepositStore = create(
  persist<DepositState>(
    (set, get) => ({
      visible: false,
      step: "form",
      token: usdtChains["bsc"],
      network: "bsc",
      recipientAddress: "",
      setVisible: (visible) => {
        set({ visible });
      },
      setStep: (step) => {
        set({ step });
      },
      setRecipientAddress: (recipientAddress) => {
        set({ recipientAddress });
      },
      setToken: (token) => {
        const prevSymbol = get().token?.symbol;
        if (prevSymbol && prevSymbol !== token.symbol) {
          const first = getFirstDepositTokenChain(token.symbol);
          if (first) {
            set({ token: first, network: first.blockchain });
            return;
          }
        }
        set({ token, network: token.blockchain });
      },
      setTokenBySymbol: (symbol) => {
        const first = getFirstDepositTokenChain(symbol);
        if (first) {
          set({ token: first, network: first.blockchain });
        }
      },
      setNetwork: (network) => {
        set({ network });
      },
      setTokenAndNetwork: (token, network) => {
        set({ token, network });
      },
      openModal: () => {
        const selectedSymbol = useWalletStore.getState().selectedToken;
        const state = get();
        let token = state.token;
        let network = state.network;

        if (
          !token ||
          token.symbol !== selectedSymbol ||
          !network ||
          !isValidDepositSelection(selectedSymbol, network)
        ) {
          const first = getFirstDepositTokenChain(selectedSymbol);
          if (first) {
            token = first;
            network = first.blockchain;
          }
        } else {
          token = findDepositTokenChain(selectedSymbol, network) ?? token;
        }

        set({
          visible: true,
          step: "form",
          recipientAddress: "",
          token,
          network,
        });
      },
      closeModal: () => {
        set({
          visible: false,
          step: "form",
          recipientAddress: "",
        });
      },
      reset: () => {
        set({
          token: usdtChains["bsc"],
          network: "bsc",
        });
      },
    }),
    {
      name: "_stableflow_deposit_store",
      version: 0.2,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) =>
        ({
          token: state.token,
          network: state.network,
        }) as DepositState,
    }
  )
);
