const chains = {
  near: {
    chainName: "Near",
    chainIcon: "/chains/near.png",
    chainType: "near",
    blockExplorerUrl: "https://nearblocks.io/txns"
  },
  sol: {
    chainName: "Solana",
    chainIcon: "/chains/solana.png",
    chainType: "sol",
    blockExplorerUrl: "https://solscan.io/tx"
  },
  eth: {
    chainName: "Ethereum",
    chainIcon: "/chains/ethereum.png",
    chainType: "evm",
    chainId: 1,
    blockExplorerUrl: "https://etherscan.io/tx"
  },
  arb: {
    chainName: "Arbitrum",
    chainIcon: "/chains/arbitrum.png",
    chainType: "evm",
    chainId: 42161,
    blockExplorerUrl: "https://arbiscan.io/tx"
  },
  bsc: {
    chainName: "BNB Chain",
    chainIcon: "/chains/bsc.png",
    chainType: "evm",
    chainId: 56,
    blockExplorerUrl: "https://bscscan.com/tx"
  },
  avax: {
    chainName: "Avalanche",
    chainIcon: "/chains/avalanche.png",
    chainType: "evm",
    chainId: 43114,
    blockExplorerUrl: "https://snowtrace.io/tx"
  },
  base: {
    chainName: "Base",
    chainIcon: "/chains/base.png",
    chainType: "evm",
    chainId: 8453,
    blockExplorerUrl: "https://basescan.org/tx"
  },
  pol: {
    chainName: "Polygon",
    chainIcon: "/chains/polygon.png",
    chainType: "evm",
    chainId: 137,
    blockExplorerUrl: "https://polygonscan.com/tx"
  },
  gnosis: {
    chainName: "Gnosis",
    chainIcon: "/chains/gnosis.png",
    chainType: "evm",
    chainId: 100,
    blockExplorerUrl: "https://gnosisscan.io/tx"
  },
  op: {
    chainName: "Optimism",
    chainIcon: "/chains/optimism.png",
    chainType: "evm",
    chainId: 10,
    blockExplorerUrl: "https://optimistic.etherscan.io/tx"
  },
  tron: {
    chainName: "Tron",
    chainIcon: "/chains/tron.png",
    chainType: "tron",
    blockExplorerUrl: "https://tronscan.org/tx"
  }
};

export default chains;
