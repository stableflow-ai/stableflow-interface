import useWalletsStore from "@/stores/use-wallets";
import { useEffect, useRef, useState } from "react";
import TronWallet from "./wallet";
import WalletSelector, { wallets } from "./wallet-selector";
import { useConfigStore } from "@/stores/use-config";
import useBalancesStore from "@/stores/use-balances";

export default function TronProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const setWallets = useWalletsStore((state) => state.set);
  const [adapter, setAdapter] = useState<any>(null);
  const [showWalletSelector, setShowWalletSelector] = useState<boolean>(false);
  const configStore = useConfigStore();
  const setBalancesStore = useBalancesStore((state) => state.set);
  const walletRef = useRef<TronWallet | null>(null);

  useEffect(() => {
    if (configStore.tronWalletAdapter) {
      setAdapter(
        wallets.find((wallet) => wallet.name === configStore.tronWalletAdapter)
      );
    }
  }, []);

  useEffect(() => {
    if (!adapter) {
      setWallets({
        tron: {
          connect: () => {
            setShowWalletSelector(true);
          }
        }
      });
      return;
    }

    walletRef.current = new TronWallet();

    configStore.set({
      tronWalletAdapter: adapter.name
    });

    const params = {
      connect: async () => {
        try {
          setShowWalletSelector(true);
        } catch (error) {
          console.error("Tron wallet connect failed:", error);
        }
      },
      disconnect: async () => {
        try {
          await adapter.disconnect();
        } catch (error) {
          console.error("Tron wallet disconnect failed:", error);
        }
      }
    };

    setWallets({
      tron: {
        account: adapter.address,
        wallet: walletRef.current,
        ...params,
        walletIcon: adapter.icon
      }
    });

    adapter.on("connect", (address: any) => {
      setWallets({
        tron: {
          account: address,
          wallet: walletRef.current,
          ...params,
          walletIcon: adapter.icon
        }
      });
    });

    adapter.on("disconnect", () => {
      setWallets({
        tron: {
          account: null,
          wallet: null,
          ...params,
          walletIcon: null
        }
      });
      setBalancesStore({
        tronBalances: {}
      });
    });

    adapter.on("accountsChanged", (accounts: any) => {
      const newAccount = accounts
        ? Array.isArray(accounts)
          ? accounts[0]
          : accounts
        : null;

      setWallets({
        tron: {
          account: newAccount,
          wallet: walletRef.current,
          ...params
        }
      });
    });
  }, [adapter]);

  return (
    <>
      {children}
      <WalletSelector
        open={showWalletSelector}
        onClose={() => setShowWalletSelector(false)}
        onWalletSelect={(wallet) => setAdapter(wallet)}
      />
    </>
  );
}
