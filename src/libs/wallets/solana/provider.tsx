import React, { useEffect, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  useWalletModal
} from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, WalletConnectWalletAdapter } from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";
import SolanaWallet from "@/libs/wallets/solana/wallet";
import useWalletsStore from "@/stores/use-wallets";
import { useWallet } from "@solana/wallet-adapter-react";

export const wallets = [
  new PhantomWalletAdapter(),
  new WalletConnectWalletAdapter({
    // @ts-ignore
    network: "mainnet-beta",
    options: {
      projectId: import.meta.env.VITE_RAINBOW_PROJECT_ID,
      metadata: {
        name: "StableFlow.ai",
        description: "",
        url: "https://demo.stableflow.ai",
        icons: [],
      },
    }
  })
];

export default function SolanaProvider({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ConnectionProvider endpoint="https://rpc.ankr.com/solana">
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          {children} <Content />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

const Content = () => {
  const [mounted, setMounted] = useState(false);
  const setWallets = useWalletsStore((state) => state.set);
  const { publicKey, disconnect, connect, wallet } = useWallet();
  const { setVisible } = useWalletModal();

  useEffect(() => {
    if (!mounted) return;
    const solanaWallet = new SolanaWallet();

    setTimeout(() => {
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
    }, 1000);
  }, [publicKey, mounted]);

  useEffect(() => {
    if (wallet) {
      wallet.adapter.connect();
    }
  }, [wallet]);

  useEffect(() => {
    setMounted(true);
  }, []);
  return null;
};
