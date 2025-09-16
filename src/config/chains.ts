export const chainTypes: Record<string, { value: string, name: string, color: string }> = {
  near: {
    value: "near",
    name: "Near",
    color: "#56DEAD",
  },
  sol: {
    value: "sol",
    name: "Solana",
    color: "#987FF3",
  },
  evm: {
    value: "evm",
    name: "EVM",
    color: "#C4CAE1",
  },
  tron: {
    value: "tron",
    name: "Tron",
    color: "#F66273",
  },
};

const chains = {
  near: {
    chainName: "Near",
    chainIcon: "/chains/near.png",
    chainIconGray: "/chains/near-gray.png",
    chainType: chainTypes.near.value,
    blockExplorerUrl: "https://nearblocks.io/txns",
  },
  sol: {
    chainName: "Solana",
    chainIcon: "/chains/solana.png",
    chainIconGray: "/chains/solana-gray.png",
    chainType: chainTypes.sol.value,
    blockExplorerUrl: "https://solscan.io/tx",
  },
  eth: {
    chainName: "Ethereum",
    chainIcon: "/chains/ethereum.png",
    chainIconGray: "/chains/ethereum-gray.png",
    chainType: chainTypes.evm.value,
    chainId: 1,
    blockExplorerUrl: "https://etherscan.io/tx",
  },
  arb: {
    chainName: "Arbitrum",
    chainIcon: "/chains/arbitrum.png",
    chainIconGray: "/chains/arbitrum-gray.png",
    chainType: chainTypes.evm.value,
    chainId: 42161,
    blockExplorerUrl: "https://arbiscan.io/tx",
  },
  bsc: {
    chainName: "BNB Chain",
    chainIcon: "/chains/bsc.png",
    chainIconGray: "/chains/bsc-gray.png",
    chainType: chainTypes.evm.value,
    chainId: 56,
    blockExplorerUrl: "https://bscscan.com/tx",
  },
  avax: {
    chainName: "Avalanche",
    chainIcon: "/chains/avalanche.png",
    chainIconGray: "/chains/avalanche-gray.png",
    chainType: chainTypes.evm.value,
    chainId: 43114,
    blockExplorerUrl: "https://snowtrace.io/tx",
  },
  base: {
    chainName: "Base",
    chainIcon: "/chains/base.png",
    chainIconGray: "/chains/base-gray.png",
    chainType: chainTypes.evm.value,
    chainId: 8453,
    blockExplorerUrl: "https://basescan.org/tx",
  },
  pol: {
    chainName: "Polygon",
    chainIcon: "/chains/polygon.png",
    chainIconGray: "/chains/polygon-gray.png",
    chainType: chainTypes.evm.value,
    chainId: 137,
    blockExplorerUrl: "https://polygonscan.com/tx",
  },
  gnosis: {
    chainName: "Gnosis",
    chainIcon: "/chains/gnosis.png",
    chainIconGray: "/chains/gnosis-gray.png",
    chainType: chainTypes.evm.value,
    chainId: 100,
    blockExplorerUrl: "https://gnosisscan.io/tx",
  },
  op: {
    chainName: "Optimism",
    chainIcon: "/chains/optimism.png",
    chainIconGray: "/chains/optimism-gray.png",
    chainType: chainTypes.evm.value,
    chainId: 10,
    blockExplorerUrl: "https://optimistic.etherscan.io/tx",
  },
  tron: {
    chainName: "Tron",
    chainIcon: "/chains/tron.png",
    chainIconGray: "/chains/tron-gray.png",
    chainType: chainTypes.tron.value,
    blockExplorerUrl: "https://tronscan.org/tx",
  }
};

export default chains;
