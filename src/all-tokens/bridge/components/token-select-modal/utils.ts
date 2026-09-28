import Big from "big.js";
import type { ChainType, TokenChain } from "@/all-tokens/chains";

export function getTokenBalance(
  token: TokenChain,
  balancesBag: Record<string, any> | undefined
): string {
  if (!balancesBag) return "0";
  const chainKey = String(token.chainId ?? token.blockchain);
  return (
    balancesBag[chainKey]?.[token.contractAddress] ||
    balancesBag[chainKey]?.[token.contractAddress?.toLowerCase?.()] ||
    "0"
  );
}

export function getTokenUsd(token: TokenChain, balance: string): number {
  return Number(Big(balance || 0).times(token.price || 0));
}

export function sumChainUsd(
  chain: ChainType,
  tokens: TokenChain[],
  balancesBag: Record<string, any> | undefined
): number {
  let total = 0;
  for (const token of tokens) {
    const sameChain =
      token.blockchain === chain.blockchain ||
      (chain.chainId != null && String(token.chainId ?? "") === String(chain.chainId));
    if (!sameChain) continue;
    total += getTokenUsd(token, getTokenBalance(token, balancesBag));
  }
  return total;
}

export function sumTypeUsd(
  chainType: string,
  tokens: TokenChain[],
  balancesBag: Record<string, any> | undefined
): number {
  let total = 0;
  for (const token of tokens) {
    if (token.chainType !== chainType) continue;
    total += getTokenUsd(token, getTokenBalance(token, balancesBag));
  }
  if (total > 0) return total;
  return Number(balancesBag?.totalUsd || 0);
}

export function isSameToken(
  a: TokenChain | null | undefined,
  b: TokenChain | null | undefined
): boolean {
  if (!a || !b) return false;
  const addrEqual =
    a.contractAddress?.toLowerCase?.() === b.contractAddress?.toLowerCase?.();
  if (!addrEqual) return false;
  return (
    a.blockchain === b.blockchain ||
    String(a.chainId ?? "") === String(b.chainId ?? "")
  );
}

export function sortTokensByUsd(
  list: TokenChain[],
  getBalance: (t: TokenChain) => string
): TokenChain[] {
  return [...list].sort((a, b) => {
    const usdA = getTokenUsd(a, getBalance(a));
    const usdB = getTokenUsd(b, getBalance(b));
    return usdB - usdA;
  });
}
