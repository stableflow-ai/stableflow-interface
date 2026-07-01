import useWalletsStore from "@/stores/use-wallets";
import { useEffect, useMemo, useRef, useState } from "react";
import TronWallet from "./wallet";
import WalletSelector from "../components/wallet-selector";
import { useConfigStore } from "@/stores/use-config";
import useBalancesStore from "@/stores/use-balances";
import { OKXTronProvider } from "@okxconnect/universal-provider";
import useIsMobile from "@/hooks/use-is-mobile";
import { TronWeb } from "tronweb";
import { OKX_ICON, useWatchOKXConnect } from "../okxconnect";
import { OkxWalletAdapter, TronLinkAdapter, WalletConnectAdapter, TrustAdapter, TokenPocketAdapter } from "@tronweb3/tronwallet-adapters";
import { useWalletSelector } from "../hooks/use-wallet-selector";
import { getChainRpcUrl } from "@/config/chains";
import { metadata } from "../rainbow/metadata";
import { csl } from "@/utils/log";
import { generateRpcSignature } from "@/libs/signature";
import { isInMobileBrowser, isInOKApp } from "../utils/device";
import { detectInjectedTronWalletName, hasInjectedTronWallet, openDeeplink } from "./deeplinks";

const tronWeb = new TronWeb({
  fullHost: getChainRpcUrl("Tron").rpcUrl,
  headers: {},
  privateKey: "",
});

const projectId = import.meta.env.VITE_RAINBOW_PROJECT_ID as string;

const wallets = [
  // Disable the adapters' built-in deeplink/redirect behavior on mobile; we
  // control deeplinks ourselves and rely on injected providers inside the
  // wallet's in-app browser. This prevents the "reopen page" redirect loop.
  new TronLinkAdapter({ openAppWithDeeplink: true, openUrlWhenWalletNotFound: false }),
  new OkxWalletAdapter(),
  new TrustAdapter({ openAppWithDeeplink: true, openUrlWhenWalletNotFound: false }),
  new TokenPocketAdapter({ openAppWithDeeplink: true, openUrlWhenWalletNotFound: false }),
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

  // Detect an injected Tron provider (in-app wallet browser). Poll briefly to
  // catch providers injected slightly after initial render.
  const [hasInjectedWallet, setHasInjectedWallet] = useState(hasInjectedTronWallet);

  useEffect(() => {
    if (hasInjectedTronWallet()) {
      setHasInjectedWallet(true);
      return;
    }

    let times = 0;
    const timer = setInterval(() => {
      times += 1;
      if (hasInjectedTronWallet()) {
        setHasInjectedWallet(true);
        clearInterval(timer);
      } else if (times >= 30) {
        clearInterval(timer);
      }
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const isOKXSDK = useMemo(() => {
    if (!isMobile) {
      return false;
    }
    if (isInOKApp()) {
      return false;
    }
    if (hasInjectedWallet) {
      return false;
    }
    return true;
  }, [isMobile, hasInjectedWallet]);

  const detectTokenPocket = () => {
    // Only detect TokenPocket in-app browser (UA contains 'tokenpocket'), do not detect desktop TokenPocket extension
    const ua = window?.navigator?.userAgent?.toLowerCase?.();
    const isTokenPocketApp = ua?.indexOf?.("tokenpocket") > -1;

    if (window && isTokenPocketApp) {
      window.location.replace("https://tron.stableflow.ai");
    }
  };

  useEffect(() => {
    detectTokenPocket();
  }, []);

  return (
    <>
      {children}
      {isOKXSDK ? <MobileWallet /> : <Content autoConnectInjected={isMobile} />}
    </>
  );
}

const Content = ({
  autoConnectInjected = false,
}: {
  autoConnectInjected?: boolean;
}) => {
  const setWallets = useWalletsStore((state) => state.set);
  const [adapter, setAdapter] = useState<any>(null);
  const configStore = useConfigStore();
  const setBalancesStore = useBalancesStore((state) => state.set);
  const walletRef = useRef<TronWallet | null>(null);
  const autoConnectedRef = useRef(false);

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
      return;
    }

    if (!autoConnectInjected || !isInMobileBrowser()) {
      return;
    }

    let times = 0;
    let timer: ReturnType<typeof setInterval>;

    const tryAutoConnect = () => {
      if (autoConnectedRef.current) {
        clearInterval(timer);
        return;
      }

      // Pick the adapter matching the wallet in-app browser we are in, instead
      // of the first "Found" adapter (TronLinkAdapter always reports Found on
      // mobile, which would select the wrong wallet).
      const injectedName = detectInjectedTronWalletName();
      const injectedAdapter = injectedName
        ? wallets.find((wallet) => wallet.name === injectedName)
        : null;

      if (injectedAdapter) {
        autoConnectedRef.current = true;
        clearInterval(timer);
        setAdapter(injectedAdapter);
        injectedAdapter.connect().catch((error) => {
          console.error("Tron injected wallet auto connect failed:", error);
        });
        return;
      }

      times += 1;
      if (times >= 30) {
        clearInterval(timer);
      }
    };

    tryAutoConnect();
    timer = setInterval(tryAutoConnect, 100);

    return () => clearInterval(timer);
  }, [autoConnectInjected]);

  const setWindowWallet = (address?: string) => {
    const _address = address || adapter?.address;
    const _tronWeb = new TronWeb({
      fullHost: getChainRpcUrl("Tron").rpcUrl,
      headers: {},
      privateKey: "",
    });
    _address && _tronWeb.setAddress(_address);
    walletRef.current = new TronWallet({
      signAndSendTransaction: async (transaction: any) => {
        if (!adapter) {
          return "";
        }
        const rpcSignature = generateRpcSignature("tron");
        _tronWeb.setHeader(rpcSignature.headers);
        const signedTx = await adapter.signTransaction(transaction);
        return _tronWeb.trx.sendRawTransaction(signedTx);
      },
      address: _address,
    });
  };

  useEffect(() => {
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
        walletIcon: adapter.icon,
        walletName: adapter.name,
      }
    });

    adapter.on("connect", (address: any) => {
      csl("TronProvider", "teal-400", "Adaptor connected, address is: %o", address);
      setWindowWallet(address);
      setWallets({
        tron: {
          account: address,
          wallet: walletRef.current,
          ...params,
          walletIcon: adapter.icon,
          walletName: adapter.name,
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

      csl("TronProvider", "teal-400", "Accounts changed, new address is: %o", newAccount);

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
  const okxConnectRef = useRef<any>(null);

  const tronLinkAdapter = wallets.find((wallet) => wallet.name === "TronLink");
  const trustAdapter = wallets.find((wallet) => wallet.name === "Trust");
  const tokenPocketAdapter = wallets.find((wallet) => wallet.name === "TokenPocket");

  const mobileWalletOptions = useMemo(() => {
    return [
      { key: "okx", name: "OKX Wallet", icon: OKX_ICON },
      { key: "tokenpocket", name: "TokenPocket", icon: tokenPocketAdapter?.icon },
      { key: "tronlink", name: "TronLink", icon: tronLinkAdapter?.icon },
      { key: "trust", name: "Trust", icon: trustAdapter?.icon },
    ];
  }, []);

  const {
    open,
    onClose,
    onOpen,
    onConnect,
    isConnecting,
  } = useWalletSelector({
    connect: async (wallet: any) => {
      if (wallet.key === "okx") {
        await okxConnectRef.current?.connect();
        return;
      }

      if (wallet.key === "tokenpocket") {
        tokenPocketAdapter?.connect?.();
        onClose();
      }

      if (wallet.key === "tronlink") {
        tronLinkAdapter?.connect?.();
        onClose();
      }

      if (wallet.key === "trust") {
        trustAdapter?.connect?.();
        onClose();
      }

      // if (wallet.key === "tokenpocket" || wallet.key === "tronlink" || wallet.key === "trust") {
      //   openDeeplink(wallet.key, window.location.href);
      //   onClose();
      // }
    },
  });

  useWatchOKXConnect((okxConnect: any) => {
    okxConnectRef.current = okxConnect;
    const { okxUniversalProvider, disconnect, icon } = okxConnect;
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
        walletName: "OKX Wallet",
        connect: () => onOpen(),
        disconnect,
      }
    });
  });

  return (
    <WalletSelector
      open={open}
      onClose={onClose}
      onConnect={onConnect}
      isConnecting={isConnecting}
      wallets={mobileWalletOptions}
      isCheckReadyState={false}
      title="Select Tron Wallet"
    />
  );
};
