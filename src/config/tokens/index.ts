import { usdcEvm, usdcNear, usdcSol, usdcChains, usdcAptos } from "@/config/tokens/usdc";
import { usdtAptos, usdtEvm, usdtNear, usdtSol, usdtTron, usdtChains, usdtTon } from "@/config/tokens/usdt";
import { usdt0Chains, usdt0Evm } from "./usdt0";
import { frxusdChains, frxusdEvm, frxusdSol } from "./frxusd";
import type { TokenChain } from "../chains";

const evmTokenChains = [
  usdcEvm.chains,
  usdtEvm.chains,
  usdt0Evm.chains,
  frxusdEvm.chains,
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

export const usdcAddresses = Object.values(usdcEvm.chains).map((chain) => ({
  [chain.chainId!]: chain.contractAddress.toLowerCase(),
})).reduce((acc, curr) => ({ ...acc, ...curr }), {});

export const usdtAddresses = Object.values(usdtEvm.chains).map((chain) => ({
  [chain.chainId!]: chain.contractAddress.toLowerCase(),
})).reduce((acc, curr) => ({ ...acc, ...curr }), {});

export const usdt0Addresses = Object.values(usdt0Evm.chains).map((chain) => ({
  [chain.chainId!]: chain.contractAddress.toLowerCase(),
})).reduce((acc, curr) => ({ ...acc, ...curr }), {});

export const frxusdAddresses = Object.values(frxusdEvm.chains).map((chain) => ({
  [chain.chainId!]: chain.contractAddress.toLowerCase(),
})).reduce((acc, curr) => ({ ...acc, ...curr }), {});

export const stablecoinWithChains: any = {
  evm: {
    "USDT": usdtEvm,
    "USDC": usdcEvm,
    "USD₮0": usdt0Evm,
    "frxUSD": frxusdEvm,
  },
  sol: {
    "USDT": usdtSol,
    "USDC": usdcSol,
    "frxUSD": frxusdSol,
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
  ton: {
    "USDT": usdtTon,
  },
};

export const stablecoinLogoMap: Record<string, string> = {
  "USDT": "/usdt.png",
  "USDC": "/usdc.png",
  "USD₮0": "/usdt0.png",
  "frxUSD": "/frxusd.png",
};

export const tokens = [
  ...Object.values(usdcChains),
  ...Object.values(usdtChains),
  ...Object.values(usdt0Chains),
  ...Object.values(frxusdChains),
];

export const allUsdtChains: Record<string, TokenChain> = {
  ...usdtChains,
  ...usdt0Chains,
};
