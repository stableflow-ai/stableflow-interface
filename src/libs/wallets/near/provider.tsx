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
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import useWalletsStore from "@/stores/use-wallets";

import "@near-wallet-selector/modal-ui/styles.css";
import NearWallet from "./wallet";

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

  useEffect(() => {
    const init = async () => {
      try {
        const _selector = await setupWalletSelector({
          network: nearNetwork.networkId as "testnet" | "mainnet",
          debug: true,
          modules: [setupMyNearWallet(), setupHereWallet(), setupMeteorWallet()]
        });

        const _modal = setupModal(_selector, {
          contractId: ""
        });

        const state = _selector.store.getState();
        const wallet = await _selector.wallet();

        const params = {
          wallet: new NearWallet(_selector),
          walletIcon: wallet?.metadata.iconUrl,
          connect: () => {
            _modal.show();
          },
          disconnect: async () => {
            await wallet.signOut();
            walletsStore.set({
              near: {
                account: null,
                wallet: null,
                connect: () => {},
                disconnect: () => {}
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

        _selector.store.observable.subscribe((state) => {
          walletsStore.set({
            near: {
              ...params,
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
  }, [nearNetwork.networkId]);

  return children;
}

export function useNEAR() {
  const context = React.useContext(NEARContext);
  if (!context) {
    throw new Error("useNEAR must be used within a NEARProvider");
  }
  return context;
}
