import useWalletsStore from "@/stores/use-wallets";
import { useEffect, useRef, useState } from "react";
import TronWallet from "./wallet";
import WalletSelector, { wallets } from "./wallet-selector";
import { useConfigStore } from "@/stores/use-config";

export default function TronProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const setWallets = useWalletsStore((state) => state.set);
  const [adapter, setAdapter] = useState<any>(null);
  const [showWalletSelector, setShowWalletSelector] = useState<boolean>(false);
  const configStore = useConfigStore();

  const walletRef = useRef<TronWallet | null>(null);

  useEffect(() => {
    console.log("configStore.tronWalletAdapter", configStore.tronWalletAdapter);
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
    });

    adapter.on("accountsChanged", (accounts: any) => {
      const newAccount = accounts && accounts.length > 0 ? accounts[0] : null;
      setWallets({
        tron: {
          account: newAccount,
          wallet: walletRef.current,
          ...params
        }
      });
    });

    const handleTronLinkMessage = (event: MessageEvent) => {
      if (event.data && event.data.message) {
        const { action, data } = event.data.message;

        if (action === "setAccount") {
          setWallets({
            tron: {
              account: data.address,
              wallet: walletRef.current,
              ...params
            }
          });
        } else if (action === "disconnect") {
          setWallets({
            tron: {
              account: null,
              wallet: null,
              ...params,
              walletIcon: null
            }
          });
        }
      }
    };

    window.addEventListener("message", handleTronLinkMessage);

    return () => {
      window.removeEventListener("message", handleTronLinkMessage);

      if (adapter) {
        adapter.removeAllListeners();
      }
    };
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
