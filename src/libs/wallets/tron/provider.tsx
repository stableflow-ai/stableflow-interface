import useWalletsStore from "@/stores/use-wallets";
import { TronLinkAdapter } from "@tronweb3/tronwallet-adapter-tronlink";
import { useEffect, useRef } from "react";
import TronWallet from "./wallet";

export default function TronProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const setWallets = useWalletsStore((state) => state.set);
  const adapterRef = useRef<TronLinkAdapter | null>(null);
  const walletRef = useRef<TronWallet | null>(null);

  useEffect(() => {
    const adapter = new TronLinkAdapter();
    adapterRef.current = adapter;
    walletRef.current = new TronWallet();

    const params = {
      connect: async () => {
        try {
          await adapter.connect();
        } catch (error) {
          console.error("Tron wallet connect failed:", error);
        }
      },
      disconnect: async () => {
        try {
          await adapter.disconnect();
          setWallets({
            tron: {
              account: null,
              wallet: null,
              connect: () => {},
              disconnect: () => {},
              walletIcon: null
            }
          });
        } catch (error) {
          console.error("Tron wallet disconnect failed:", error);
        }
      }
    };

    setWallets({
      tron: {
        account: null,
        wallet: walletRef.current,
        ...params,
        walletIcon: null
      }
    });

    adapter.on("connect", (address) => {
      setWallets({
        tron: {
          account: address,
          wallet: walletRef.current,
          ...params,
          walletIcon: null
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

    adapter.on("accountsChanged", (accounts) => {
      const newAccount = accounts && accounts.length > 0 ? accounts[0] : null;
      setWallets({
        tron: {
          account: newAccount,
          wallet: walletRef.current,
          ...params,
          walletIcon: null
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
              ...params,
              walletIcon: null
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

      if (adapterRef.current) {
        adapterRef.current.removeAllListeners();
      }
    };
  }, [setWallets]);

  return children;
}
