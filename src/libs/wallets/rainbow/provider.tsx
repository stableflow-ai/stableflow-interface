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
  berachain,
  xLayer,
  plasma,
  mantle,
  megaeth,
  ink,
  stable,
  celo,
  sei,
  flare,
} from "viem/chains";
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
import { metaMaskWallet, coinbaseWallet, okxWallet, bitgetWallet, binanceWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import { createClient, fallback } from "viem";
import { getChainRpcUrl } from "@/config/chains";
import { useEVMWalletInfo } from "@/hooks/use-evm-wallet-info";

const projectId = import.meta.env.VITE_RAINBOW_PROJECT_ID as string;
export const metadata = {
  name: "StableFlow.ai",
  description: "Stablecoins to any chain, with one click.",
  // origin must match your domain & subdomain
  url: "https://app.stableflow.ai",
  icons: ["/logo.svg"]
};

const RpcUrls: any = {
  [mainnet.id]: fallback(getChainRpcUrl("Ethereum").rpcUrls.map((rpc) => http(rpc))),
  [polygon.id]: fallback(getChainRpcUrl("Polygon").rpcUrls.map((rpc) => http(rpc))),
  [arbitrum.id]: fallback(getChainRpcUrl("Arbitrum").rpcUrls.map((rpc) => http(rpc))),
  [optimism.id]: fallback(getChainRpcUrl("Optimism").rpcUrls.map((rpc) => http(rpc))),
  [bsc.id]: fallback(getChainRpcUrl("BNB Chain").rpcUrls.map((rpc) => http(rpc))),
  [base.id]: fallback(getChainRpcUrl("Base").rpcUrls.map((rpc) => http(rpc))),
  [avalanche.id]: fallback(getChainRpcUrl("Avalanche").rpcUrls.map((rpc) => http(rpc))),
  [gnosis.id]: fallback(getChainRpcUrl("Gnosis").rpcUrls.map((rpc) => http(rpc))),
  [berachain.id]: fallback(getChainRpcUrl("Berachain").rpcUrls.map((rpc) => http(rpc))),
  [xLayer.id]: fallback(getChainRpcUrl("X Layer").rpcUrls.map((rpc) => http(rpc))),
  [plasma.id]: fallback(getChainRpcUrl("Plasma").rpcUrls.map((rpc) => http(rpc))),
  [mantle.id]: fallback(getChainRpcUrl("Mantle").rpcUrls.map((rpc) => http(rpc))),
  [megaeth.id]: fallback(getChainRpcUrl("MegaETH").rpcUrls.map((rpc) => http(rpc))),
  [ink.id]: fallback(getChainRpcUrl("Ink").rpcUrls.map((rpc) => http(rpc))),
  [stable.id]: fallback(getChainRpcUrl("Stable").rpcUrls.map((rpc) => http(rpc))),
  [celo.id]: fallback(getChainRpcUrl("Celo").rpcUrls.map((rpc) => http(rpc))),
  [sei.id]: fallback(getChainRpcUrl("Sei").rpcUrls.map((rpc) => http(rpc))),
  [flare.id]: fallback(getChainRpcUrl("Flare").rpcUrls.map((rpc) => http(rpc))),
};

const config = getDefaultConfig({
  appName: metadata.name,
  appDescription: metadata.description,
  appUrl: metadata.url,
  appIcon: metadata.icons[0],
  projectId,
  chains: [
    mainnet,
    polygon,
    arbitrum,
    bsc,
    base,
    avalanche,
    optimism,
    gnosis,
    berachain,
    xLayer,
    plasma,
    mantle,
    megaeth,
    ink,
    stable,
    celo,
    sei,
    flare,
  ],
  transports: {
    [mainnet.id]: RpcUrls[mainnet.id] || http(),
    [polygon.id]: RpcUrls[polygon.id] || http(),
    [arbitrum.id]: RpcUrls[arbitrum.id] || http(),
    [bsc.id]: RpcUrls[bsc.id] || http(),
    [base.id]: RpcUrls[base.id] || http(),
    [avalanche.id]: RpcUrls[avalanche.id] || http(),
    [optimism.id]: RpcUrls[optimism.id] || http(),
    [gnosis.id]: RpcUrls[gnosis.id] || http(),
    [berachain.id]: RpcUrls[berachain.id] || http(),
    [xLayer.id]: RpcUrls[xLayer.id] || http(),
    [plasma.id]: RpcUrls[plasma.id] || http(),
    [mantle.id]: RpcUrls[mantle.id] || http(),
    [megaeth.id]: RpcUrls[megaeth.id] || http(),
    [ink.id]: RpcUrls[ink.id] || http(),
    [stable.id]: RpcUrls[stable.id] || http(),
    [celo.id]: RpcUrls[celo.id] || http(),
    [sei.id]: RpcUrls[sei.id] || http(),
    [flare.id]: RpcUrls[flare.id] || http(),
  },
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
        walletConnectWallet,
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
    if (RpcUrls[chain.id]) {
      return createClient({
        chain,
        transport: RpcUrls[chain.id],
      })
    }
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
  const evmWalletInfo = useEVMWalletInfo();

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
          walletIcon: evmWalletInfo.icon,
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
  }, [account, publicClient, walletClient, mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  return null;
}
