import React, { useEffect, useMemo, useState } from "react";
import SuiWallet from "@/libs/wallets/sui/wallet";
import useWalletsStore from "@/stores/use-wallets";
import useBalancesStore from "@/stores/use-balances";
import { useDebounceFn } from "ahooks";
import { useWalletSelector } from "../hooks/use-wallet-selector";
import WalletSelector from "../components/wallet-selector";

import {
  createDAppKit,
  DAppKitProvider,
  useCurrentWallet,
  useDAppKit,
  useWalletConnection,
  useWallets,
  useCurrentAccount,
  useCurrentClient,
} from "@mysten/dapp-kit-react";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import { getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc";
import { getChainRpcUrl } from "@/config/chains";

export default function SuiProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const dAppKit = createDAppKit({
    networks: ["mainnet"],
    defaultNetwork: "mainnet",
    createClient: (network) => {
      return new SuiGrpcClient({
        network,
        baseUrl: getChainRpcUrl("Sui").rpcUrl ?? getJsonRpcFullnodeUrl("mainnet"),
      });
    },
    autoConnect: true,
    enableBurnerWallet: false,
    walletInitializers: [],
    slushWalletConfig: null,
    storage: typeof window !== "undefined" ? localStorage : undefined,
    storageKey: "stableflow.ai_sui_dapp_kit",

  });

  return (
    <DAppKitProvider
      dAppKit={dAppKit}
    >
      {children}
      <Content />
    </DAppKitProvider>
  );
}

const AllWallets = [
  {
    name: "Phantom",
    icon: "/wallets/phantom.svg",
    url: "https://phantom.com/",
  },
  {
    name: "OKX Wallet",
    icon: "/wallets/okx.png",
    url: "https://web3.okx.com/download",
  },
];

const Content = () => {
  const [mounted, setMounted] = useState(false);
  const setWallets = useWalletsStore((state) => state.set);

  const wallets = useWallets()
  const dappKit = useDAppKit()
  const { connectWallet: connect, disconnectWallet: disconnect, signAndExecuteTransaction } = dappKit
  const currentWallet = useCurrentWallet()
  const { } = useWalletConnection()

  const account = useCurrentAccount();
  const currentClient = useCurrentClient();

  const [installedWallets, uninstalledWallets] = useMemo(() => {
    const _installedWallets = [];
    const _uninstalledWallets = [];
    for (const _wallet of AllWallets) {
      const installedWallet = wallets.find((__wallet) => __wallet.name === _wallet.name);
      if (installedWallet) {
        _installedWallets.push({
          ...installedWallet,
          readyState: "Installed",
        });
        continue;
      }
      _uninstalledWallets.push(_wallet);
    }
    return [_installedWallets, _uninstalledWallets];
  }, [wallets]);

  const setBalancesStore = useBalancesStore((state) => state.set);

  // Wallet selector
  const {
    open,
    onClose,
    onOpen,
    onConnect,
    isConnecting,
  } = useWalletSelector({
    connect: async (wallet: any) => {
      const connector = wallets.find((wallet) => wallet.name === wallet.name);
      if (!connector) {
        return;
      }
      await connect({ wallet: connector });
    },
  });

  const { run: connect2SuiWallets } = useDebounceFn(() => {
    if (!mounted) return;
    const suiWallet = new SuiWallet({
      account: account || null,
      signAndExecuteTransaction,
      suiClient: currentClient as any,
    });
    setWallets({
      sui: {
        account: account?.address || null,
        wallet: suiWallet,
        walletIcon: currentWallet?.icon,
        connect: () => {
          if (currentWallet) {
            onConnect(currentWallet.name);
          } else {
            onOpen();
          }
        },
        disconnect: () => {
          disconnect();
          setBalancesStore({
            suiBalances: {}
          });
          setWallets({
            sui: {
              account: null,
              wallet: null,
              connect: () => { },
              disconnect: () => { }
            }
          });
        }
      }
    });
  }, { wait: 500 });

  useEffect(() => {
    connect2SuiWallets();
  }, [account, mounted]);

  const { run: connectDelay } = useDebounceFn(() => {
    if (!currentWallet) {
      return;
    }
    onConnect(currentWallet.name);
  }, { wait: 500 });

  useEffect(() => {
    connectDelay();
  }, [currentWallet]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WalletSelector
      open={open}
      onClose={onClose}
      onConnect={onConnect}
      isConnecting={isConnecting}
      wallets={[...installedWallets, ...uninstalledWallets]}
      readyState={{ key: "readyState", value: "Installed" }}
      title="Select Sui Wallet"
    />
  );
};
