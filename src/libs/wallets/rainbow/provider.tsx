import React, { useEffect, useState } from "react";
import {
  mainnet,
  polygon,
  arbitrum,
  bsc,
  base,
  avalanche,
  optimism,
  gnosis,
  berachain
} from "wagmi/chains";
import {
  WagmiProvider,
  useAccount,
  useDisconnect,
  usePublicClient,
  useWalletClient,
  cookieToInitialState,
  createConfig,
  http
} from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RainbowKitProvider,
  connectorsForWallets,
  getDefaultConfig,
  useConnectModal
} from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import RainbowWallet from "./wallet";
import "@rainbow-me/rainbowkit/styles.css";
import useWalletsStore from "@/stores/use-wallets";
import { useDebounceFn } from "ahooks";
import useBalancesStore from "@/stores/use-balances";
import { metaMaskWallet, coinbaseWallet, okxWallet, bitgetWallet, binanceWallet } from "@rainbow-me/rainbowkit/wallets";
import { createClient } from "viem";

const projectId = import.meta.env.VITE_RAINBOW_PROJECT_ID as string;
export const metadata = {
  name: "StableFlow.ai",
  description: "Stablecoins to any chain, with one click.",
  // origin must match your domain & subdomain
  url: "https://app.stableflow.ai",
  icons: ["/logo.svg"]
};
const config = getDefaultConfig({
  appName: metadata.name,
  appDescription: metadata.description,
  appUrl: metadata.url,
  appIcon: metadata.icons[0],
  projectId,
  chains: [mainnet, polygon, arbitrum, bsc, base, avalanche, optimism, gnosis, berachain],
});
const connectors: any = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        okxWallet,
        metaMaskWallet,
        coinbaseWallet,
        bitgetWallet,
        binanceWallet,
      ],
    },
  ],
  {
    appName: metadata.name,
    projectId,
  }
);
const wagmiConfig = createConfig({
  ...config,
  connectors,
  client: ({ chain }) => {
    return createClient({
      chain,
      transport: http()
    })
  }
});

const queryClient = new QueryClient();

export default function RainbowProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const initialState = cookieToInitialState(wagmiConfig);

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
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
  const account = useAccount();
  const setBalancesStore = useBalancesStore((state) => state.set);
  const { openConnectModal } = useConnectModal();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const [mounted, setMounted] = useState(false);
  const setWallets = useWalletsStore((state) => state.set);

  const { run: debouncedDisconnect } = useDebounceFn(
    async () => {
      if (!publicClient || !mounted) return;
      const provider = new ethers.BrowserProvider(publicClient);

      const signer = walletClient
        ? await new ethers.BrowserProvider(walletClient).getSigner()
        : null;

      const wallet = new RainbowWallet(provider, signer);

      if (!account.address) {
        setBalancesStore({
          evmBalances: {}
        });
        clearTimeout(window.updateEvmBalancesTimer);
      }

      setWallets({
        evm: {
          account: account.address || null,
          chainId: account.chainId,
          wallet: wallet,
          connect: () => {
            openConnectModal?.();
          },
          disconnect: () => {
            disconnect?.();
            setBalancesStore({
              evmBalances: {}
            });
            setWallets({
              evm: {
                account: null,
                wallet: null
              }
            });
          }
        }
      });
    },
    {
      wait: 500
    }
  );

  useEffect(() => {
    debouncedDisconnect();
  }, [account, publicClient, walletClient]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return null;
}
