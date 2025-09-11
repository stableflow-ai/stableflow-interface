import React, { useEffect } from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import SolanaWallet from "./wallet";
import useWalletsStore from "@/stores/use-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";

export const wallets = [new PhantomWalletAdapter()];

export default function SolanaProvider({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          {children}
          <Content />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function Content() {
  const { publicKey, disconnect, connect } = useWallet();
  const setWallets = useWalletsStore((state) => state.set);

  useEffect(() => {
    const wallet = new SolanaWallet(null);

    setWallets({
      sol: {
        account: publicKey?.toString() || null,
        wallet: wallet,
        connect: () => {
          connect();
        },
        disconnect: () => {
          disconnect();
          window.solana.account = null;
        }
      }
    });
  }, [publicKey, connect, disconnect]);

  return null;
}
