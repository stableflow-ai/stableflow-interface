import { usdcEvm, usdcNear, usdcSol, usdcChains, usdcAptos } from "@/config/tokens/usdc";
import { usdtAptos, usdtEvm, usdtNear, usdtSol, usdtTron, usdtChains } from "@/config/tokens/usdt";

const evmTokenChains = [
  usdcEvm.chains,
  usdtEvm.chains,
];
export const evmBalancesTokens: { chain_id: number; tokens: string[]; decimals: number[]; }[] = (() => {
  const map: any = {};
  for (const chains of evmTokenChains) {
    chains.forEach((chain: any) => {
      if (map[chain.chainName]) {
        map[chain.chainName].tokens.push(chain.contractAddress);
        map[chain.chainName].decimals.push(chain.decimals);
        map[chain.chainName].symbols.push(chain.symbol);
      } else {
        map[chain.chainName] = {
          chain_id: chain.chainId,
          tokens: [chain.contractAddress],
          decimals: [chain.decimals],
          symbols: [chain.symbol],
        };
      }
    });
  }

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
    "USDC": usdcAptos,
  },
};

export const stablecoinLogoMap: Record<string, string> = {
  "USDT": "/usdt.png",
  "USDC": "/usdc.png",
};

export const tokens = [
  ...Object.values(usdcChains),
  ...Object.values(usdtChains),
];
