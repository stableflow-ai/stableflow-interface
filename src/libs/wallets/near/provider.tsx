import React, { useEffect } from "react";
import {
  setupWalletSelector,
  type WalletSelector,
  type AccountState
} from "@near-wallet-selector/core";
import {
  setupModal,
  type WalletSelectorModal
} from "@near-wallet-selector/modal-ui";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupIntearWallet } from "@near-wallet-selector/intear-wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupHotWallet } from "@near-wallet-selector/hot-wallet";
import useWalletsStore from "@/stores/use-wallets";

import "@near-wallet-selector/modal-ui/styles.css";
import NearWallet from "./wallet";
import useBalancesStore from "@/stores/use-balances";

interface NEARContextType {
  selector: WalletSelector | null;
  modal: WalletSelectorModal | null;
  accounts: AccountState[];
  accountId: string | null;
}

const NEARContext = React.createContext<NEARContextType>({
  selector: null,
  modal: null,
  accounts: [],
  accountId: null
});

export default function NEARProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const nearNetwork = {
    networkId: "mainnet",
    nodeUrl: "https://rpc.mainnet.near.org",
    walletUrl: "https://app.mynearwallet.com/",
    helperUrl: "https://helper.mainnet.near.org",
    explorerUrl: "https://nearblocks.io"
  };
  const walletsStore = useWalletsStore();
  const setBalancesStore = useBalancesStore((state) => state.set);
  useEffect(() => {
    const init = async () => {
      try {
        const _selector = await setupWalletSelector({
          network: nearNetwork.networkId as "testnet" | "mainnet",
          debug: false,
          modules: [
            setupMyNearWallet(),
            setupHotWallet() as unknown as any,
            setupMeteorWallet(),
            setupIntearWallet()
          ]
        });

        const _modal = setupModal(_selector, {
          contractId: ""
        });

        const state = _selector.store.getState();

        const params = {
          wallet: new NearWallet(_selector),

          connect: () => {
            _modal.show();
          },
          disconnect: async () => {
            const wallet = await _selector.wallet();
            await wallet.signOut();
            setBalancesStore({
              nearBalances: {}
            });
            walletsStore.set({
              near: {
                account: null,
                wallet: null
              }
            });
          }
        };

        walletsStore.set({
          near: {
            ...params,
            account:
              state.accounts.find((account) => account.active)?.accountId ||
              null
          }
        });

        _selector.store.observable.subscribe(async (state) => {
          const wallet = await _selector.wallet();
          walletsStore.set({
            near: {
              ...params,
              walletIcon: wallet?.metadata.iconUrl,
              account:
                state.accounts.find((account) => account.active)?.accountId ||
                null
            }
          });
        });
      } catch (error) {
        console.error("init near wallet selector failed:", error);
      }
    };

    init();
  }, [nearNetwork.networkId, walletsStore?.near?.account]);

  return children;
}

export function useNEAR() {
  const context = React.useContext(NEARContext);
  if (!context) {
    throw new Error("useNEAR must be used within a NEARProvider");
  }
  return context;
}
