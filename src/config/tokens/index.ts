import { usdcEvm, usdcNear, usdcSol, usdcChains } from "@/config/tokens/usdc";
import { usdtAptos, usdtEvm, usdtNear, usdtSol, usdtTron, usdtChains } from "@/config/tokens/usdt";
import { usdt0Chains, usdt0Evm } from "./usdt0";

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
  usdt0Evm.chains.forEach((chain: any) => {
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

export const usdcAddresses = Object.values(usdcEvm.chains).map((chain) => ({
  [chain.chainId!]: chain.contractAddress.toLowerCase(),
})).reduce((acc, curr) => ({ ...acc, ...curr }), {});

export const usdtAddresses = Object.values(usdtEvm.chains).map((chain) => ({
  [chain.chainId!]: chain.contractAddress.toLowerCase(),
})).reduce((acc, curr) => ({ ...acc, ...curr }), {});

export const usdt0Addresses = Object.values(usdt0Evm.chains).map((chain) => ({
  [chain.chainId!]: chain.contractAddress.toLowerCase(),
})).reduce((acc, curr) => ({ ...acc, ...curr }), {});

export const stablecoinWithChains: any = {
  evm: {
    "USDT": usdtEvm,
    "USDC": usdcEvm,
    "USD₮0": usdt0Evm,
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

export const stablecoinLogoMap: Record<string, string> = {
  "USDT": "/usdt.png",
  "USDC": "/usdc.png",
  "USD₮0": "/usdt0.png",
};

export const tokens = [
  ...Object.values(usdcChains),
  ...Object.values(usdtChains),
  ...Object.values(usdt0Chains),
];
