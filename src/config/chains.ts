import type { Service } from "@/services/constants";

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
};

export const chainsRpcUrls: Record<string, string[]> = {
  "Ethereum": ["https://eth.merkle.io", "https://ethereum-rpc.publicnode.com"],
  "Arbitrum": ["https://arb1.arbitrum.io/rpc", "https://arbitrum-one-rpc.publicnode.com"],
  "BNB Chain": ["https://56.rpc.thirdweb.com", "https://bsc-rpc.publicnode.com"],
  "Avalanche": ["https://api.avax.network/ext/bc/C/rpc", "https://avalanche-c-chain-rpc.publicnode.com"],
  "Base": ["https://mainnet.base.org", "https://base-rpc.publicnode.com"],
  "Polygon": ["https://polygon-rpc.com", "https://polygon-bor-rpc.publicnode.com"],
  "Gnosis": ["https://rpc.gnosischain.com", "https://gnosis-rpc.publicnode.com"],
  "Optimism": ["https://mainnet.optimism.io", "https://optimism-rpc.publicnode.com"],
  "Berachain": ["https://rpc.berachain.com", "https://berachain-rpc.publicnode.com"],
  "Tron": ["https://tron-rpc.publicnode.com"],
  "Aptos": ["https://api.mainnet.aptoslabs.com/v1"],
  "Solana": ["https://mainnet.helius-rpc.com/?api-key=28fc7f18-acf0-48a1-9e06-bd1b6cba1170", "https://solana-rpc.publicnode.com"],
  "Near": ["https://nearinner.deltarpc.com"],
  "X Layer": ["https://rpc.xlayer.tech"],
  "Plasma": ["https://rpc.plasma.to"],
  "Mantle": ["https://rpc.mantle.xyz", "https://mantle-rpc.publicnode.com"],
  "MegaETH": ["https://mainnet.megaeth.com/rpc"],
  "Ink": ["https://rpc-gel.inkonchain.com", "https://rpc-qnd.inkonchain.com"],
  "Stable": ["https://rpc.stable.xyz"],
  "Celo": ["https://forno.celo.org", "https://celo-rpc.publicnode.com"],
  "Sei": ["https://sei-evm-rpc.publicnode.com"],
  "Flare": ["https://flare-api.flare.network/ext/C/rpc"],
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
    chainIcon: "/chains/near.png",
    chainIconGray: "/chains/near-gray.png",
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
    chainIcon: "/chains/solana.png",
    chainIconGray: "/chains/solana-gray.png",
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
    chainIcon: "/chains/ethereum.png",
    chainIconGray: "/chains/ethereum-gray.png",
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
    chainIcon: "/chains/arbitrum.png",
    chainIconGray: "/chains/arbitrum-gray.png",
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
    chainIcon: "/chains/bsc.png",
    chainIconGray: "/chains/bsc-gray.png",
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
    chainIcon: "/chains/avalanche.png",
    chainIconGray: "/chains/avalanche-gray.png",
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
    chainIcon: "/chains/base.png",
    chainIconGray: "/chains/base-gray.png",
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
    chainIcon: "/chains/polygon.png",
    chainIconGray: "/chains/polygon-gray.png",
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
    chainIcon: "/chains/gnosis.png",
    chainIconGray: "/chains/gnosis-gray.png",
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
    chainIcon: "/chains/optimism.png",
    chainIconGray: "/chains/optimism-gray.png",
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
    chainIcon: "/chains/tron.png",
    chainIconGray: "/chains/tron-gray.png",
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
    chainIcon: "/chains/aptos.png",
    chainIconGray: "/chains/aptos-gray.png",
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
    chainIcon: "/chains/berachain.png",
    chainIconGray: "/chains/berachain-gray.png",
    chainType: chainTypes.evm.value,
    chainId: 80094,
    blockExplorerUrl: "https://berascan.com/tx/",
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
    chainIcon: "/chains/xlayer.png",
    chainIconGray: "/chains/xlayer-gray.png",
    chainType: chainTypes.evm.value,
    chainId: 196,
    blockExplorerUrl: "https://www.oklink.com/xlayer/tx/",
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
    chainIcon: "/chains/plasma.png",
    chainIconGray: "/chains/plasma-gray.png",
    chainType: chainTypes.evm.value,
    chainId: 9745,
    blockExplorerUrl: "https://plasmascan.to/tx/",
    primaryColor: "#162F29",
    nativeToken: {
      symbol: "XPL",
      decimals: 18,
    },
    ...getChainRpcUrl("Plasma"),
  },
  mantle: {
    chainName: "Mantle",
    blockchain: "mantle",
    chainIcon: "/chains/mantle.png",
    chainIconGray: "/chains/mantle-gray.png",
    chainType: chainTypes.evm.value,
    chainId: 5000,
    blockExplorerUrl: "https://mantlescan.xyz/tx/",
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
    chainIcon: "/chains/megaeth.png",
    chainIconGray: "/chains/megaeth-gray.png",
    chainType: chainTypes.evm.value,
    chainId: 4326,
    blockExplorerUrl: "https://mega.etherscan.io/tx/",
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
    chainIcon: "/chains/ink.png",
    chainIconGray: "/chains/ink-gray.png",
    chainType: chainTypes.evm.value,
    chainId: 57073,
    blockExplorerUrl: "https://explorer.inkonchain.com/tx/",
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
    chainIcon: "/chains/stable.png",
    chainIconGray: "/chains/stable-gray.png",
    chainType: chainTypes.evm.value,
    chainId: 988,
    blockExplorerUrl: "https://uniscan.xyz/tx/",
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
    chainIcon: "/chains/celo.png",
    chainIconGray: "/chains/celo-gray.png",
    chainType: chainTypes.evm.value,
    chainId: 42_220,
    blockExplorerUrl: "https://celoscan.io/tx/",
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
    chainIcon: "/chains/sei.png",
    chainIconGray: "/chains/sei-gray.png",
    chainType: chainTypes.evm.value,
    chainId: 1329,
    blockExplorerUrl: "https://seitrace.com/tx/",
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
    chainIcon: "/chains/flare.png",
    chainIconGray: "/chains/flare-gray.png",
    chainType: chainTypes.evm.value,
    chainId: 14,
    blockExplorerUrl: "https://flare-explorer.flare.network/tx/",
    primaryColor: "#E62058",
    nativeToken: {
      symbol: "FLR",
      decimals: 18,
    },
    ...getChainRpcUrl("Flare"),
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
