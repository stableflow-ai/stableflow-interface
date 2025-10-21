import { usdcEvm, usdcNear, usdcSol } from "@/config/tokens/usdc";
import { usdtAptos, usdtEvm, usdtNear, usdtSol, usdtTron } from "@/config/tokens/usdt";

export const evmBalancesTokens = (() => {
  const map: any = {};
  usdcEvm.chains.forEach((chain: any) => {
    if (map[chain.chainName]) {
      map[chain.chainName].tokens.push(chain.contractAddress);
    } else {
      map[chain.chainName] = {
        chain_id: chain.chainId,
        tokens: [chain.contractAddress]
      };
    }
  });
  usdtEvm.chains.forEach((chain: any) => {
    if (map[chain.chainName]) {
      map[chain.chainName].tokens.push(chain.contractAddress);
    } else {
      map[chain.chainName] = {
        chain_id: chain.chainId,
        tokens: [chain.contractAddress]
      };
    }
  });

  return Object.values(map);
})();

export const usdcAddresses = Object.values(usdcEvm.chains).map((chain) =>
  chain.contractAddress.toLowerCase()
);

export const usdtAddresses = Object.values(usdtEvm.chains).map((chain) =>
  chain.contractAddress.toLowerCase()
);

export const stablecoinWithChains: any = {
  evm: {
    "USDT": usdtEvm,
    "USDC": usdcEvm,
  },
  sol: {
    "USDT": usdtSol,
    "USDC": usdcSol,
  },
  near: {
    "USDT": usdtNear,
    "USDC": usdcNear,
  },
  tron: {
    "USDT": usdtTron,
  },
  aptos: {
    "USDT": usdtAptos,
  },
};
