import useWalletsStore from "@/stores/use-wallets";
import { useEffect, useRef, useState } from "react";
import TronWallet, { OKXTronWallet } from "./wallet";
import WalletSelector, { wallets } from "./wallet-selector";
import { useConfigStore } from "@/stores/use-config";
import useBalancesStore from "@/stores/use-balances";
import { OKXTronProvider } from "@okxconnect/universal-provider";
import useIsMobile from "@/hooks/use-is-mobile";
import { TronWeb } from "tronweb";
import { useWatchOKXConnect } from "../okxconnect";

const tronWeb = new TronWeb({
  fullHost: "https://api.trongrid.io",
  headers: {},
  privateKey: "",
});

export default function TronProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  return (
    <>
      {children}
      {isMobile ? <MobileWallet /> : <Content />}
    </>
  );
}

const Content = () => {
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
    <WalletSelector
      open={showWalletSelector}
      onClose={() => setShowWalletSelector(false)}
      onWalletSelect={(wallet) => setAdapter(wallet)}
    />
  );
};

const MobileWallet = () => {
  const setWallets = useWalletsStore((state) => state.set);

  useWatchOKXConnect((okxConnect: any) => {
    const { okxUniversalProvider, connect, disconnect, icon } = okxConnect;
    const provider = new OKXTronProvider(okxUniversalProvider);

    // @ts-ignore
    const account = provider.getAccount()?.address || null;
    console.log("tron provider: %o", provider);
    console.log("tron account: %o", account);
    const tronWallet = new OKXTronWallet({
      account: account,
      signTransaction: (transaction: any) => {
        return provider.signTransaction(transaction, "tron:mainnet");
      },
      signAndSendTransaction: (transaction: any) => {
        return provider.signAndSendTransaction(transaction, "tron:mainnet");
      },
      tronWeb: tronWeb,
    });

    setWallets({
      tron: {
        account,
        wallet: tronWallet,
        walletIcon: icon,
        connect,
        disconnect,
      }
    });
  });

  return null;
};
