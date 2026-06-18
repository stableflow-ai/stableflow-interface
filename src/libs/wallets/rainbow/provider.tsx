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
  fraxtal,
  katana,
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
  useConnectModal
} from "@rainbow-me/rainbowkit";
import { ethers } from "ethers";
import RainbowWallet from "./wallet";
import "@rainbow-me/rainbowkit/styles.css";
import useWalletsStore from "@/stores/use-wallets";
import { useDebounceFn } from "ahooks";
import useBalancesStore from "@/stores/use-balances";
import { metaMaskWallet, base as baseWallet, okxWallet, bitgetWallet, binanceWallet, walletConnectWallet } from "@rainbow-me/rainbowkit/wallets";
import { fallback } from "viem";
import { getChainRpcUrl } from "@/config/chains";
import { useEVMWalletInfo } from "@/hooks/use-evm-wallet-info";
import { metadata } from "./metadata";
import { generateRpcSignature } from "@/libs/signature";
import { PROXY_RPC_DOMAIN } from "@/config/api";

const projectId = import.meta.env.VITE_RAINBOW_PROJECT_ID as string;

// RPC_CHAINS="tron,solana,aptos,aptos,sui,ethereum,arbitrum,bsc,avalanche,base,polygon,gnosis,optimism,berachain,xlayer,plasma,mantle,megaeth,ink,stable,celo,sei,fraxtal,katana"
const isSignedRpcUrl = (rpcUrl: string) => {
  return rpcUrl.includes(PROXY_RPC_DOMAIN);
}

const getSignedRpcHttpConfig = (rpcUrl: string, chain: string) => {
  if (!isSignedRpcUrl(rpcUrl)) {
    return {};
  }

  return {
    onFetchRequest: (_request: Request, init: RequestInit) => {
      const { headers } = generateRpcSignature(chain);

      return {
        ...init,
        headers: {
          ...(init.headers as Record<string, string> | undefined),
          ...headers,
        },
      };
    },
  };
};

const RpcUrls: any = {
  [mainnet.id]: fallback(getChainRpcUrl("Ethereum").rpcUrls.map((rpc) => http(rpc, getSignedRpcHttpConfig(rpc, "ethereum")))),
  [polygon.id]: fallback(getChainRpcUrl("Polygon").rpcUrls.map((rpc) => http(rpc, getSignedRpcHttpConfig(rpc, "polygon")))),
  [arbitrum.id]: fallback(getChainRpcUrl("Arbitrum").rpcUrls.map((rpc) => http(rpc, getSignedRpcHttpConfig(rpc, "arbitrum")))),
  [optimism.id]: fallback(getChainRpcUrl("Optimism").rpcUrls.map((rpc) => http(rpc, getSignedRpcHttpConfig(rpc, "optimism")))),
  [bsc.id]: fallback(getChainRpcUrl("BNB Chain").rpcUrls.map((rpc) => http(rpc, getSignedRpcHttpConfig(rpc, "bsc")))),
  [base.id]: fallback(getChainRpcUrl("Base").rpcUrls.map((rpc) => http(rpc, getSignedRpcHttpConfig(rpc, "base")))),
  [avalanche.id]: fallback(getChainRpcUrl("Avalanche").rpcUrls.map((rpc) => http(rpc, getSignedRpcHttpConfig(rpc, "avalanche")))),
  [gnosis.id]: fallback(getChainRpcUrl("Gnosis").rpcUrls.map((rpc) => http(rpc, getSignedRpcHttpConfig(rpc, "gnosis")))),
  [berachain.id]: fallback(getChainRpcUrl("Berachain").rpcUrls.map((rpc) => http(rpc, getSignedRpcHttpConfig(rpc, "berachain")))),
  [xLayer.id]: fallback(getChainRpcUrl("X Layer").rpcUrls.map((rpc) => http(rpc, getSignedRpcHttpConfig(rpc, "xlayer")))),
  [plasma.id]: fallback(getChainRpcUrl("Plasma").rpcUrls.map((rpc) => http(rpc, getSignedRpcHttpConfig(rpc, "plasma")))),
  [mantle.id]: fallback(getChainRpcUrl("Mantle").rpcUrls.map((rpc) => http(rpc, getSignedRpcHttpConfig(rpc, "mantle")))),
  [megaeth.id]: fallback(getChainRpcUrl("MegaETH").rpcUrls.map((rpc) => http(rpc, getSignedRpcHttpConfig(rpc, "megaeth")))),
  [ink.id]: fallback(getChainRpcUrl("Ink").rpcUrls.map((rpc) => http(rpc, getSignedRpcHttpConfig(rpc, "ink")))),
  [stable.id]: fallback(getChainRpcUrl("Stable").rpcUrls.map((rpc) => http(rpc, getSignedRpcHttpConfig(rpc, "stable")))),
  [celo.id]: fallback(getChainRpcUrl("Celo").rpcUrls.map((rpc) => http(rpc, getSignedRpcHttpConfig(rpc, "celo")))),
  [sei.id]: fallback(getChainRpcUrl("Sei").rpcUrls.map((rpc) => http(rpc, getSignedRpcHttpConfig(rpc, "sei")))),
  [flare.id]: fallback(getChainRpcUrl("Flare").rpcUrls.map((rpc) => http(rpc))),
  [fraxtal.id]: fallback(getChainRpcUrl("Fraxtal").rpcUrls.map((rpc) => http(rpc, getSignedRpcHttpConfig(rpc, "fraxtal")))),
  [katana.id]: fallback(getChainRpcUrl("Katana").rpcUrls.map((rpc) => http(rpc, getSignedRpcHttpConfig(rpc, "katana")))),
};

const connectors: any = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        okxWallet,
        metaMaskWallet,
        baseWallet,
        bitgetWallet,
        binanceWallet,
        walletConnectWallet,
      ],
    },
  ],
  {
    appName: metadata.name,
    appDescription: metadata.description,
    appUrl: metadata.url,
    appIcon: metadata.icons[0],
    projectId,
  }
);

const wagmiConfig = createConfig({
  connectors,
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
    fraxtal,
    katana,
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
    [fraxtal.id]: RpcUrls[fraxtal.id] || http(),
    [katana.id]: RpcUrls[katana.id] || http(),
  },
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
        ? await new ethers.BrowserProvider(walletClient.transport).getSigner()
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
          walletName: evmWalletInfo.name,
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
