import React, { useEffect, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";
import SolanaWallet from "@/libs/wallets/solana/wallet";
import useWalletsStore from "@/stores/use-wallets";
import { useWallet } from "@solana/wallet-adapter-react";

export const wallets = [new PhantomWalletAdapter()];

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
  const { publicKey, disconnect } = useWallet();

  useEffect(() => {
    if (!mounted) return;
    const solanaWallet = new SolanaWallet();

    setTimeout(() => {
      setWallets({
        sol: {
          account:
            publicKey?.toString() ||
            window?.solana?._publicKey?.toString() ||
            null,
          wallet: solanaWallet,
          connect: () => {},
          disconnect: () => {
            disconnect();
            setWallets({
              sol: {
                account: null,
                wallet: null,
                connect: () => {},
                disconnect: () => {}
              }
            });
          }
        }
      });
    }, 1000);
  }, [publicKey, mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);
  return null;
};
