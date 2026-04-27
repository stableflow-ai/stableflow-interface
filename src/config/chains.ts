import type { Service } from "@/services/constants";
import { getStableflowChainLogo } from "@/utils/format/logo";

export const chainTypes: Record<string, { value: string; name: string; color: string; bg: string; }> = {
  near: {
    value: "near",
    name: "Near",
    color: "#56DEAD",
    bg: "linear-gradient(90deg, rgba(1, 237, 151, 0.20) 0%, rgba(1, 237, 151, 0.00) 50%)",
  },
  sol: {
    value: "sol",
    name: "Solana",
    color: "#987FF3",
    bg: "linear-gradient(90deg, rgba(248, 108, 255, 0.20) 0%, rgba(248, 108, 255, 0.00) 50%)",
  },
  evm: {
    value: "evm",
    name: "EVM",
    color: "#C4CAE1",
    bg: "linear-gradient(90deg, rgba(185, 215, 255, 0.20) 0%, rgba(185, 215, 255, 0.00) 50%)",
  },
  tron: {
    value: "tron",
    name: "Tron",
    color: "#F66273",
    bg: "linear-gradient(90deg, rgba(210, 31, 16, 0.20) 0%, rgba(210, 31, 16, 0.00) 50%)",
  },
  aptos: {
    value: "aptos",
    name: "Aptos",
    color: "#000000",
    bg: "linear-gradient(90deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.00) 50%)",
  },
  ton: {
    value: "ton",
    name: "Ton",
    color: "#0098EA",
    bg: "linear-gradient(90deg, rgba(0, 152, 234, 0.20) 0%, rgba(0, 152, 234, 0.00) 50%)",
  },
  sui: {
    value: "sui",
    name: "Sui",
    color: "#298DFF",
    bg: "linear-gradient(90deg, rgba(41, 141, 255, 0.20) 0%, rgba(0, 152, 234, 0.00) 50%)",
  },
};

const HeliusRpcApiKey = import.meta.env.VITE_HELIUS_RPC_API_KEY;
const AlchemyRpcApiKey = import.meta.env.VITE_ALCHEMY_RPC_API_KEY;

export const chainsRpcUrls: Record<string, string[]> = {
  "Ethereum": ["https://0xrpc.io/eth", "https://ethereum-rpc.publicnode.com"],
  "Arbitrum": ["https://arb1.arbitrum.io/rpc", "https://arbitrum-one-rpc.publicnode.com"],
  "BNB Chain": ["https://56.rpc.thirdweb.com", "https://bsc-rpc.publicnode.com"],
  "Avalanche": ["https://api.avax.network/ext/bc/C/rpc", "https://avalanche-c-chain-rpc.publicnode.com"],
  "Base": ["https://mainnet.base.org", "https://base-rpc.publicnode.com"],
  "Polygon": ["https://polygon.drpc.org", "https://polygon-bor-rpc.publicnode.com"],
  "Gnosis": ["https://rpc.gnosischain.com", "https://gnosis-rpc.publicnode.com"],
  "Optimism": ["https://mainnet.optimism.io", "https://optimism-rpc.publicnode.com"],
  "Berachain": ["https://rpc.berachain.com", "https://berachain-rpc.publicnode.com"],
  "Tron": ["https://tron-rpc.publicnode.com"],
  "Aptos": ["https://api.mainnet.aptoslabs.com/v1"],
  "Solana": [`https://mainnet.helius-rpc.com/?api-key=${HeliusRpcApiKey}`, `https://solana-mainnet.g.alchemy.com/v2/${AlchemyRpcApiKey}`, "https://solana-rpc.publicnode.com"],
  "Near": ["https://nearinner.deltarpc.com"],
  "X Layer": ["https://rpc.xlayer.tech", "https://xlayer.drpc.org"],
  "Plasma": ["https://rpc.plasma.to", "https://plasma.drpc.org"],
  "Mantle": ["https://rpc.mantle.xyz", "https://mantle-rpc.publicnode.com"],
  "MegaETH": ["https://mainnet.megaeth.com/rpc"],
  "Ink": ["https://rpc-gel.inkonchain.com", "https://rpc-qnd.inkonchain.com"],
  "Stable": ["https://rpc.stable.xyz"],
  "Celo": ["https://forno.celo.org", "https://celo-rpc.publicnode.com"],
  "Sei": ["https://sei-evm-rpc.publicnode.com"],
  "Flare": ["https://flare-api.flare.network/ext/C/rpc"],
  "Fraxtal": ["https://rpc.frax.com"],
  "Ton": ["https://toncenter.com/api/v2/jsonRPC"],
  "Sui": ["https://fullnode.mainnet.sui.io:443"],
  "Katana": ["https://rpc.katana.network", "https://katana.drpc.org"],
};

export const getChainRpcUrl = (chainName: string): { rpcUrls: string[]; rpcUrl: string; } => {
  return {
    rpcUrls: chainsRpcUrls[chainName],
    rpcUrl: chainsRpcUrls[chainName][0],
  };
};

const chains = {
  near: {
    chainName: "Near",
    blockchain: "near", // https://1click.chaindefuser.com/v0/tokens blockchain
    chainIcon: getStableflowChainLogo("near"),
    chainIconGray: getStableflowChainLogo("near-gray"),
    chainType: chainTypes.near.value,
    blockExplorerUrl: "https://nearblocks.io/txns",
    primaryColor: "#76EA9E",
    nativeToken: {
      symbol: "NEAR",
      decimals: 24,
    },
    ...getChainRpcUrl("Near"),
  },
  sol: {
    chainName: "Solana",
    blockchain: "sol",
    chainIcon: getStableflowChainLogo("solana"),
    chainIconGray: getStableflowChainLogo("solana-gray"),
    chainType: chainTypes.sol.value,
    blockExplorerUrl: "https://solscan.io/tx",
    primaryColor: "#B93EF0",
    nativeToken: {
      symbol: "SOL",
      decimals: 9,
    },
    ...getChainRpcUrl("Solana"),
  },
  eth: {
    chainName: "Ethereum",
    blockchain: "eth",
    chainIcon: getStableflowChainLogo("Ethereum"),
    chainIconGray: getStableflowChainLogo("Ethereum-gray"),
    chainType: chainTypes.evm.value,
    chainId: 1,
    blockExplorerUrl: "https://etherscan.io/tx",
    primaryColor: "#7083ee",
    nativeToken: {
      symbol: "ETH",
      decimals: 18,
    },
    ...getChainRpcUrl("Ethereum"),
  },
  arb: {
    chainName: "Arbitrum",
    blockchain: "arb",
    chainIcon: getStableflowChainLogo("Arbitrum"),
    chainIconGray: getStableflowChainLogo("Arbitrum-gray"),
    chainType: chainTypes.evm.value,
    chainId: 42161,
    blockExplorerUrl: "https://arbiscan.io/tx",
    primaryColor: "#4763A7",
    nativeToken: {
      symbol: "ETH",
      decimals: 18,
    },
    ...getChainRpcUrl("Arbitrum"),
  },
  bsc: {
    chainName: "BNB Chain",
    blockchain: "bsc",
    chainIcon: getStableflowChainLogo("bsc"),
    chainIconGray: getStableflowChainLogo("bsc-gray"),
    chainType: chainTypes.evm.value,
    chainId: 56,
    blockExplorerUrl: "https://bscscan.com/tx",
    primaryColor: "#F1C144",
    nativeToken: {
      symbol: "BNB",
      decimals: 18,
    },
    ...getChainRpcUrl("BNB Chain"),
  },
  avax: {
    chainName: "Avalanche",
    blockchain: "avax",
    chainIcon: getStableflowChainLogo("Avalanche"),
    chainIconGray: getStableflowChainLogo("Avalanche-gray"),
    chainType: chainTypes.evm.value,
    chainId: 43114,
    blockExplorerUrl: "https://snowtrace.io/tx",
    primaryColor: "#9D2620",
    nativeToken: {
      symbol: "AVAX",
      decimals: 18,
    },
    ...getChainRpcUrl("Avalanche"),
  },
  base: {
    chainName: "Base",
    blockchain: "base",
    chainIcon: getStableflowChainLogo("Base"),
    chainIconGray: getStableflowChainLogo("Base-gray"),
    chainType: chainTypes.evm.value,
    chainId: 8453,
    blockExplorerUrl: "https://basescan.org/tx",
    primaryColor: "#3137F6",
    nativeToken: {
      symbol: "ETH",
      decimals: 18,
    },
    ...getChainRpcUrl("Base"),
  },
  pol: {
    chainName: "Polygon",
    blockchain: "pol",
    chainIcon: getStableflowChainLogo("Polygon"),
    chainIconGray: getStableflowChainLogo("Polygon-gray"),
    chainType: chainTypes.evm.value,
    chainId: 137,
    blockExplorerUrl: "https://polygonscan.com/tx",
    primaryColor: "#5A2AD1",
    nativeToken: {
      symbol: "POL",
      decimals: 18,
    },
    ...getChainRpcUrl("Polygon"),
  },
  gnosis: {
    chainName: "Gnosis",
    blockchain: "gnosis",
    chainIcon: getStableflowChainLogo("Gnosis"),
    chainIconGray: getStableflowChainLogo("Gnosis-gray"),
    chainType: chainTypes.evm.value,
    chainId: 100,
    blockExplorerUrl: "https://gnosisscan.io/tx",
    primaryColor: "#285230",
    nativeToken: {
      symbol: "XDAI",
      decimals: 18,
    },
    ...getChainRpcUrl("Gnosis"),
  },
  op: {
    chainName: "Optimism",
    blockchain: "op",
    chainIcon: getStableflowChainLogo("Optimism"),
    chainIconGray: getStableflowChainLogo("Optimism-gray"),
    chainType: chainTypes.evm.value,
    chainId: 10,
    blockExplorerUrl: "https://optimistic.etherscan.io/tx",
    primaryColor: "#B5271D",
    nativeToken: {
      symbol: "ETH",
      decimals: 18,
    },
    ...getChainRpcUrl("Optimism"),
  },
  tron: {
    chainName: "Tron",
    blockchain: "tron",
    chainIcon: getStableflowChainLogo("Tron"),
    chainIconGray: getStableflowChainLogo("Tron-gray"),
    chainType: chainTypes.tron.value,
    blockExplorerUrl: "https://tronscan.org/#/transaction",
    primaryColor: "#BC3221",
    nativeToken: {
      symbol: "TRX",
      decimals: 6,
    },
    ...getChainRpcUrl("Tron"),
  },
  aptos: {
    chainName: "Aptos",
    blockchain: "aptos",
    chainIcon: getStableflowChainLogo("Aptos"),
    chainIconGray: getStableflowChainLogo("Aptos-gray"),
    chainType: chainTypes.aptos.value,
    blockExplorerUrl: "https://aptoscan.com/transaction",
    primaryColor: "#000000",
    nativeToken: {
      symbol: "APT",
      decimals: 8,
    },
    ...getChainRpcUrl("Aptos"),
  },
  bera: {
    chainName: "Berachain",
    blockchain: "bera",
    chainIcon: getStableflowChainLogo("Berachain"),
    chainIconGray: getStableflowChainLogo("Berachain-gray"),
    chainType: chainTypes.evm.value,
    chainId: 80094,
    blockExplorerUrl: "https://berascan.com/tx",
    primaryColor: "#F37325",
    nativeToken: {
      symbol: "BERA",
      decimals: 18,
    },
    ...getChainRpcUrl("Berachain"),
  },
  xlayer: {
    chainName: "X Layer",
    blockchain: "xlayer",
    chainIcon: getStableflowChainLogo("xlayer"),
    chainIconGray: getStableflowChainLogo("xlayer-gray"),
    chainType: chainTypes.evm.value,
    chainId: 196,
    blockExplorerUrl: "https://www.oklink.com/xlayer/tx",
    primaryColor: "#000000",
    nativeToken: {
      symbol: "OKB",
      decimals: 18,
    },
    ...getChainRpcUrl("X Layer"),
  },
  plasma: {
    chainName: "Plasma",
    blockchain: "plasma",
    chainIcon: getStableflowChainLogo("Plasma"),
    chainIconGray: getStableflowChainLogo("Plasma-gray"),
    chainType: chainTypes.evm.value,
    chainId: 9745,
    blockExplorerUrl: "https://plasmascan.to/tx",
    primaryColor: "#162F29",
    nativeToken: {
      symbol: "XPL",
      decimals: 18,
    },
    ...getChainRpcUrl("Plasma"),
  },
  ton: {
    chainName: "Ton",
    blockchain: "ton",
    chainIcon: getStableflowChainLogo("Ton"),
    chainIconGray: getStableflowChainLogo("Ton-gray"),
    chainType: chainTypes.ton.value,
    blockExplorerUrl: "https://tonviewer.com/transaction",
    primaryColor: "#0098EA",
    nativeToken: {
      symbol: "TON",
      decimals: 9,
    },
    ...getChainRpcUrl("Ton"),
  },
  mantle: {
    chainName: "Mantle",
    blockchain: "mantle",
    chainIcon: getStableflowChainLogo("Mantle"),
    chainIconGray: getStableflowChainLogo("Mantle-gray"),
    chainType: chainTypes.evm.value,
    chainId: 5000,
    blockExplorerUrl: "https://mantlescan.xyz/tx",
    primaryColor: "#162F29",
    nativeToken: {
      symbol: "MNT",
      decimals: 18,
    },
    ...getChainRpcUrl("Mantle"),
  },
  megaeth: {
    chainName: "MegaETH",
    blockchain: "megaeth",
    chainIcon: getStableflowChainLogo("MegaETH"),
    chainIconGray: getStableflowChainLogo("MegaETH-gray"),
    chainType: chainTypes.evm.value,
    chainId: 4326,
    blockExplorerUrl: "https://mega.etherscan.io/tx",
    primaryColor: "#19191A",
    nativeToken: {
      symbol: "ETH",
      decimals: 18,
    },
    ...getChainRpcUrl("MegaETH"),
  },
  ink: {
    chainName: "Ink",
    blockchain: "ink",
    chainIcon: getStableflowChainLogo("Ink"),
    chainIconGray: getStableflowChainLogo("Ink-gray"),
    chainType: chainTypes.evm.value,
    chainId: 57073,
    blockExplorerUrl: "https://explorer.inkonchain.com/tx",
    primaryColor: "#7132F5",
    nativeToken: {
      symbol: "ETH",
      decimals: 18,
    },
    ...getChainRpcUrl("Ink"),
  },
  stable: {
    chainName: "Stable",
    blockchain: "stable",
    chainIcon: getStableflowChainLogo("Stable"),
    chainIconGray: getStableflowChainLogo("Stable-gray"),
    chainType: chainTypes.evm.value,
    chainId: 988,
    blockExplorerUrl: "https://uniscan.xyz/tx",
    primaryColor: "#01241D",
    nativeToken: {
      symbol: "USDT0",
      decimals: 18,
    },
    ...getChainRpcUrl("Stable"),
  },
  celo: {
    chainName: "Celo",
    blockchain: "celo",
    chainIcon: getStableflowChainLogo("Celo"),
    chainIconGray: getStableflowChainLogo("Celo-gray"),
    chainType: chainTypes.evm.value,
    chainId: 42_220,
    blockExplorerUrl: "https://celoscan.io/tx",
    primaryColor: "#FCFF52",
    nativeToken: {
      symbol: "CELO",
      decimals: 18,
    },
    ...getChainRpcUrl("Celo"),
  },
  sei: {
    chainName: "Sei",
    blockchain: "sei",
    chainIcon: getStableflowChainLogo("Sei"),
    chainIconGray: getStableflowChainLogo("Sei-gray"),
    chainType: chainTypes.evm.value,
    chainId: 1329,
    blockExplorerUrl: "https://seitrace.com/tx",
    primaryColor: "#991717",
    nativeToken: {
      symbol: "SEI",
      decimals: 18,
    },
    ...getChainRpcUrl("Sei"),
  },
  flare: {
    chainName: "Flare",
    blockchain: "flare",
    chainIcon: getStableflowChainLogo("Flare"),
    chainIconGray: getStableflowChainLogo("Flare-gray"),
    chainType: chainTypes.evm.value,
    chainId: 14,
    blockExplorerUrl: "https://flare-explorer.flare.network/tx",
    primaryColor: "#E62058",
    nativeToken: {
      symbol: "FLR",
      decimals: 18,
    },
    ...getChainRpcUrl("Flare"),
  },
  frax: {
    chainName: "Fraxtal",
    blockchain: "frax",
    chainIcon: getStableflowChainLogo("Frax"),
    chainIconGray: getStableflowChainLogo("Frax-gray"),
    chainType: chainTypes.evm.value,
    chainId: 252,
    blockExplorerUrl: "https://fraxscan.com/tx",
    primaryColor: "#000",
    nativeToken: {
      symbol: "FRAX",
      decimals: 18,
    },
    ...getChainRpcUrl("Fraxtal"),
  },
  sui: {
    chainName: "Sui",
    blockchain: "sui",
    chainIcon: "/chains/sui.png",
    chainIconGray: "/chains/sui-gray.png",
    chainType: chainTypes.sui.value,
    blockExplorerUrl: "https://suiscan.xyz/mainnet/tx",
    primaryColor: "#298DFF",
    nativeToken: {
      symbol: "SUI",
      decimals: 9,
    },
    ...getChainRpcUrl("Sui"),
  },
  katana: {
    chainName: "Katana",
    blockchain: "katana",
    chainIcon: "/chains/katana.png",
    chainIconGray: "/chains/katana-gray.png",
    chainType: chainTypes.evm.value,
    chainId: 747474,
    blockExplorerUrl: "https://katanascan.com/tx",
    primaryColor: "#F6FF0D",
    nativeToken: {
      symbol: "ETH",
      decimals: 18,
    },
    ...getChainRpcUrl("Katana"),
  },
};

export default chains;

export interface TokenChain {
  symbol: string;
  decimals: number;
  icon: string;
  assetId?: string;
  contractAddress: string;
  services: Service[];

  chainName: string;
  blockchain: string;
  chainIcon: string;
  chainIconGray: string;
  chainType: string;
  chainId?: number;
  blockExplorerUrl: string;
  primaryColor: string;
  nativeToken: { symbol: string; decimals: number; };
  rpcUrls: string[];
  rpcUrl: string;
}
