import React, { useEffect, useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  // WalletConnectWalletAdapter
} from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";
import SolanaWallet from "@/libs/wallets/solana/wallet";
import useWalletsStore from "@/stores/use-wallets";
import { useWallet } from "@solana/wallet-adapter-react";
import useBalancesStore from "@/stores/use-balances";
import useIsMobile from "@/hooks/use-is-mobile";
import { useDebounceFn } from "ahooks";
import { OKXSolanaProvider } from "@okxconnect/solana-provider";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useWatchOKXConnect } from "../okxconnect";
import SolanaWalletSelectorProvider, { useSolanaWalletModal } from "./wallet-selector";
import { getChainRpcUrl } from "@/config/chains";

export const adapters = [
  new SolflareWalletAdapter(),
  new PhantomWalletAdapter(),
  // new WalletConnectWalletAdapter({
  //   // @ts-ignore
  //   network: "mainnet-beta",
  //   options: {
  //     projectId: import.meta.env.VITE_RAINBOW_PROJECT_ID,
  //     metadata: {
  //       name: "StableFlow.ai",
  //       description: "",
  //       url: "https://demo.stableflow.ai",
  //       icons: []
  //     }
  //   }
  // })
];

export default function SolanaProvider({
  children
}: {
  children: React.ReactNode;
}) {
  // Wallet order configuration: Solflare first, Phantom second
  const walletOrder = ["Solflare", "Phantom"];
  const endpoint = getChainRpcUrl("Solana").rpcUrl;

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={adapters} autoConnect={true}>
        <SolanaWalletSelectorProvider walletOrder={walletOrder}>
          {children}<DeviceDetector />
        </SolanaWalletSelectorProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

const DeviceDetector = (props: any) => {
  const { } = props;

  const isMobile = useIsMobile();
  const { wallets } = useWallet();

  const installedWallets = useMemo(() => {
    return wallets.filter((wallet) => wallet.readyState === "Installed");
  }, [wallets]);

  const isOKXSDK = useMemo(() => {
    return installedWallets?.length <= 0 && isMobile;
  }, [isMobile, installedWallets]);

  return isOKXSDK ? (
    <MobileContent />
  ) : (
    <Content />
  );
};

const Content = () => {
  const [mounted, setMounted] = useState(false);
  const setWallets = useWalletsStore((state) => state.set);
  const walletAdapter = useWallet();
  const { publicKey, disconnect, connect, wallet } = walletAdapter;
  const { setVisible } = useSolanaWalletModal();
  const setBalancesStore = useBalancesStore((state) => state.set);

  const { run: connect2SolanaWallets } = useDebounceFn(() => {
    if (!mounted) return;
    const solanaWallet = new SolanaWallet({
      publicKey,
      signer: walletAdapter,
    });
    setWallets({
      sol: {
        account: publicKey?.toString() || null,
        wallet: solanaWallet,
        walletIcon: wallet?.adapter.icon,
        connect: () => {
          if (wallet) {
            connect();
          } else {
            setVisible?.(true);
          }
        },
        disconnect: () => {
          disconnect();
          setBalancesStore({
            solBalances: {}
          });
          setWallets({
            sol: {
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
    connect2SolanaWallets();
  }, [publicKey, mounted]);

  const { run: connectDelay } = useDebounceFn(() => {
    if (!wallet) {
      return;
    }
    connect();
  }, { wait: 500 });

  useEffect(() => {
    connectDelay();
  }, [wallet]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return null;
};

const MobileContent = () => {
  const setWallets = useWalletsStore((state) => state.set);

  useWatchOKXConnect((okxConnect: any) => {
    const { okxUniversalProvider, connect, disconnect, icon } = okxConnect;
    const provider = new OKXSolanaProvider(okxUniversalProvider);
    const account = provider.getAccount()?.address || null;
    const solanaWallet = new SolanaWallet({
      publicKey: account ? new PublicKey(account) : null,
      signer: {
        ...provider,
        publicKey: account ? new PublicKey(account) : null,
        signTransaction: (transaction: Transaction) => {
          return provider.signTransaction(transaction, "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp");
        },
      },
    });

    setWallets({
      sol: {
        account,
        wallet: solanaWallet,
        walletIcon: icon,
        connect: connect,
        disconnect: disconnect,
      }
    });
  });

  return null;
};
