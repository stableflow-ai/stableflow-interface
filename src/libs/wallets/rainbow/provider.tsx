import React, { useEffect, useState } from "react";
import { mainnet, polygon } from "wagmi/chains";
import {
  WagmiProvider,
  useAccount,
  useDisconnect,
  usePublicClient,
  useWalletClient,
  useConnect,
  cookieToInitialState
} from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RainbowKitProvider,
  getDefaultConfig,
  useConnectModal
} from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import RainbowWallet from "./wallet";
import "@rainbow-me/rainbowkit/styles.css";
import useWalletsStore from "@/stores/use-wallets";

const config = getDefaultConfig({
  appName: "StableFlow.ai",
  projectId: import.meta.env.VITE_RAINBOW_PROJECT_ID,
  chains: [mainnet, polygon]
});

const queryClient = new QueryClient();

export default function RainbowProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const initialState = cookieToInitialState(config);

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact" locale="en-US">
          {children}
          <Content />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

function Content() {
  const { disconnect } = useDisconnect();
  const { address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [mounted, setMounted] = useState(false);
  const setWallets = useWalletsStore((state) => state.set);

  useEffect(() => {
    if (!mounted || !publicClient) return;

    const init = async () => {
      const provider = new ethers.BrowserProvider(publicClient);
      const signer = walletClient
        ? await new ethers.BrowserProvider(walletClient).getSigner()
        : null;

      const wallet = new RainbowWallet(provider, signer);

      setWallets({
        evm: {
          account: address || null,
          wallet: wallet,
          connect: () => {},
          disconnect: () => {
            disconnect?.();
            setWallets({
              evm: {
                account: null,
                wallet: null,
                connect: () => {},
                disconnect: () => {}
              }
            });
          }
        }
      });
    };

    init();
  }, [address, publicClient, walletClient, mounted, openConnectModal]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return null;
}
