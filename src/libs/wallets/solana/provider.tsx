import React, { useEffect, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  useWalletModal
} from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
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

export const adapters = [
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
  const isMobile = useIsMobile();

  return (
    <ConnectionProvider endpoint="https://rpc.ankr.com/solana">
      <WalletProvider wallets={adapters} autoConnect={false}>
        <WalletModalProvider>
          {children} {isMobile ? <MobileContent /> : <Content />}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

const Content = () => {
  const [mounted, setMounted] = useState(false);
  const setWallets = useWalletsStore((state) => state.set);
  const walletAdapter = useWallet();
  const { publicKey, disconnect, connect, wallet } = walletAdapter;
  const { setVisible } = useWalletModal();
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
            setVisible(true);
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
