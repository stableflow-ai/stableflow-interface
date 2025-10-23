import React, { useEffect, useState } from "react";
import AptosWallet from "@/libs/wallets/aptos/wallet";
import useWalletsStore from "@/stores/use-wallets";
import useBalancesStore from "@/stores/use-balances";
import useIsMobile from "@/hooks/use-is-mobile";
import { useDebounceFn } from "ahooks";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useWatchOKXConnect } from "../okxconnect";
import { OKXAptosProvider } from "@okxconnect/aptos-provider";
import { useWalletSelector } from "../hooks/use-wallet-selector";
import WalletSelector from "../components/wallet-selector";

export default function AptosProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ network: Network.MAINNET }}
      onError={(error) => {
        console.log("error", error);
      }}
      optInWallets={[
        "OKX Wallet",
        "Petra",
        "Nightly",
        "Pontem Wallet",
        "Backpack",
        "MSafe",
        "Bitget Wallet",
        "Gate Wallet",
      ]}
    >
      {children} {isMobile ? <MobileContent /> : <Content />}
    </AptosWalletAdapterProvider>
  );
}

const Content = () => {
  const [mounted, setMounted] = useState(false);
  const setWallets = useWalletsStore((state) => state.set);
  const {
    account,
    connect,
    disconnect,
    signAndSubmitTransaction,
    wallet,
    wallets,
    notDetectedWallets,
  } = useWallet();

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
      await connect(wallet.name);
    },
  });

  const { run: connect2AptosWallets } = useDebounceFn(() => {
    if (!mounted) return;
    const aptosWallet = new AptosWallet({
      account: account?.address.toString() || null,
      signAndSubmitTransaction,
    });
    setWallets({
      aptos: {
        account: account?.address.toString() || null,
        wallet: aptosWallet,
        walletIcon: wallet?.icon,
        connect: () => {
          if (wallet) {
            onConnect(wallet.name);
          } else {
            onOpen();
          }
        },
        disconnect: () => {
          disconnect();
          setBalancesStore({
            aptosBalances: {}
          });
          setWallets({
            aptos: {
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
    connect2AptosWallets();
  }, [account, mounted]);

  const { run: connectDelay } = useDebounceFn(() => {
    if (!wallet) {
      return;
    }
    onConnect(wallet.name);
  }, { wait: 500 });

  useEffect(() => {
    connectDelay();
  }, [wallet]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WalletSelector
      open={open}
      onClose={onClose}
      onConnect={onConnect}
      isConnecting={isConnecting}
      wallets={[...wallets, ...notDetectedWallets]}
      readyState={{ key: "readyState", value: "Installed" }}
      title="Select Aptos Wallet"
    />
  );
};

const MobileContent = () => {
  const setWallets = useWalletsStore((state) => state.set);

  useWatchOKXConnect((okxConnect: any) => {
    const { okxUniversalProvider, connect, disconnect, icon } = okxConnect;
    const provider = new OKXAptosProvider(okxUniversalProvider);
    const account = provider.getAccount("aptos:mainnet")?.address || null;
    const aptosWallet = new AptosWallet({
      isMobile: true,
      account: account,
      signAndSubmitTransaction: ((transaction: any) => {
        return provider.signAndSubmitTransaction(transaction, "aptos:mainnet");
      }) as any,
    });

    setWallets({
      aptos: {
        account,
        wallet: aptosWallet,
        walletIcon: icon,
        connect: connect,
        disconnect: disconnect,
      }
    });
  });

  return null;
};
