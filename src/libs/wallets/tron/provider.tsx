import useWalletsStore from "@/stores/use-wallets";
import { useEffect, useMemo, useRef, useState } from "react";
import TronWallet from "./wallet";
import WalletSelector from "../components/wallet-selector";
import { useConfigStore } from "@/stores/use-config";
import useBalancesStore from "@/stores/use-balances";
import { OKXTronProvider } from "@okxconnect/universal-provider";
import useIsMobile from "@/hooks/use-is-mobile";
import { TronWeb } from "tronweb";
import { useWatchOKXConnect } from "../okxconnect";
import { OkxWalletAdapter, TronLinkAdapter, WalletConnectAdapter } from "@tronweb3/tronwallet-adapters";
import { useWalletSelector } from "../hooks/use-wallet-selector";
import { chainsRpcUrls } from "@/config/chains";
import { metadata } from "../rainbow/provider";

const tronWeb = new TronWeb({
  fullHost: chainsRpcUrls["Tron"],
  headers: {},
  privateKey: "",
});

const projectId = import.meta.env.VITE_RAINBOW_PROJECT_ID as string;

const wallets = [
  new TronLinkAdapter(),
  new OkxWalletAdapter(),
  new WalletConnectAdapter({
    network: "Mainnet",
    options: {
      metadata,
      projectId,
    },
    web3ModalConfig: {
      termsOfServiceUrl: "https://app.stableflow.ai/terms-of-service",
      privacyPolicyUrl: "https://app.stableflow.ai/privacy-policy",
      themeVariables: {
        "--wcm-z-index": "210",
      },
    },
  }),
];

export default function TronProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  const installedWallets = useMemo(() => {
    return wallets.filter((wallet) => wallet.readyState === "Found");
  }, [wallets]);

  const isOKXSDK = useMemo(() => {
    return installedWallets?.length <= 0 && isMobile;
  }, [isMobile, installedWallets]);

  return (
    <>
      {children}
      {isOKXSDK ? <MobileWallet /> : <Content />}
    </>
  );
}

const Content = () => {
  const setWallets = useWalletsStore((state) => state.set);
  const [adapter, setAdapter] = useState<any>(null);
  const configStore = useConfigStore();
  const setBalancesStore = useBalancesStore((state) => state.set);
  const walletRef = useRef<TronWallet | null>(null);

  // Wallet selector
  const {
    open,
    onClose,
    onOpen,
    onConnect,
    isConnecting,
  } = useWalletSelector({
    connect: async (wallet: any) => {
      await wallet.connect(wallet);
      setAdapter(wallet);
    },
  });

  useEffect(() => {
    // Restore previously saved adapter (only exists if user hasn't actively disconnected)
    if (configStore.tronWalletAdapter) {
      const savedAdapter = wallets.find((wallet) => wallet.name === configStore.tronWalletAdapter);
      if (savedAdapter) {
        setAdapter(savedAdapter);
      }
    }
  }, []);

  useEffect(() => {
    const setWindowWallet = (address?: string) => {
      const windowTronWeb = (window as any).tronWeb;
      walletRef.current = new TronWallet({
        signAndSendTransaction: async (transaction: any) => {
          const signedTransaction = await windowTronWeb.trx.sign(transaction);
          return windowTronWeb.trx.sendRawTransaction(signedTransaction);
        },
        address: address || windowTronWeb?.defaultAddress?.base58,
      });
    };
    setWindowWallet();

    if (!adapter) {
      setWallets({
        tron: {
          wallet: walletRef.current,
          connect: () => {
            onOpen();
          }
        }
      });
      return;
    }

    configStore.set({
      tronWalletAdapter: adapter.name
    });

    const params = {
      connect: async () => {
        try {
          onOpen();
        } catch (error) {
          console.error("Tron wallet connect failed:", error);
        }
      },
      disconnect: async () => {
        try {
          await adapter.disconnect();
          configStore.set({
            tronWalletAdapter: null
          });
          setAdapter(null);
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
      console.log("%cAdaptor connected, address is: %o", "background:#423c27;color:#fdf4aa;", address);
      setWindowWallet(address);
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
          wallet: walletRef.current,
          ...params,
          walletIcon: null
        }
      });
      setBalancesStore({
        tronBalances: {}
      });
      configStore.set({
        tronWalletAdapter: null
      });
      setAdapter(null);
    });

    adapter.on("accountsChanged", (accounts: any) => {
      const newAccount = accounts
        ? Array.isArray(accounts)
          ? accounts[0]
          : accounts
        : null;

      console.log("%cAccounts changed, new address is: %o", "background:#423c27;color:#fdf4aa;", newAccount);

      setWindowWallet(newAccount);
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
      open={open}
      onClose={onClose}
      onConnect={onConnect}
      isConnecting={isConnecting}
      wallets={wallets}
      readyState={{ key: "_readyState", value: "Found" }}
      title="Select Tron Wallet"
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
    account && tronWeb.setAddress(account);
    const tronWallet = new TronWallet({
      signAndSendTransaction: (transaction: any) => {
        return provider.signAndSendTransaction(transaction, "tron:mainnet");
      },
      address: account,
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

  const detectTokenPocket = () => {
    const ua = window?.navigator?.userAgent?.toLowerCase?.();
    const isTokenPocket = (window?.tronLink as any)?.isTokenPocket ?? ua?.indexOf?.("tokenpocket") > -1;

    if (window && isTokenPocket) {
      window.location.replace("https://tron.stableflow.ai");
    }
  };

  useEffect(() => {
    detectTokenPocket();
  }, []);

  return null;
};
