import type { TokenChain } from "@/config/chains";
import { stablecoinLogoMap, tokens } from "@/config/tokens";

const depositTokenWithChains: Record<string, TokenChain[]> = {};
tokens.forEach((token) => {
  const currentToken = depositTokenWithChains[token.symbol];
  if (currentToken) {
    if (currentToken.some((item) => item.blockchain === token.blockchain)) {
      return;
    }
    depositTokenWithChains[token.symbol].push(token);
    return;
  }
  depositTokenWithChains[token.symbol] = [token];
});

const DEPOSIT_TOKEN_SYMBOLS_SORT = ["USDT", "USD₮0", "USDC", "frxUSD"];
export const DEPOSIT_TOKEN_SYMBOLS = Object.keys(depositTokenWithChains).sort((a, b) => {
  return DEPOSIT_TOKEN_SYMBOLS_SORT.indexOf(a) - DEPOSIT_TOKEN_SYMBOLS_SORT.indexOf(b);
});

export function getDepositNetworksBySymbol(symbol: string): TokenChain[] {
  return depositTokenWithChains[symbol];
}

export function findDepositTokenChain(
  symbol: string,
  networkKey: string
): TokenChain | null {
  const networks = getDepositNetworksBySymbol(symbol);
  return networks.find((chain) => chain.blockchain === networkKey) ?? null;
}

export function getFirstDepositTokenChain(symbol: string): TokenChain | null {
  const networks = getDepositNetworksBySymbol(symbol);
  return networks[0] ?? null;
}

export function getDepositTokenMeta(symbol: string) {
  return {
    symbol,
    icon: stablecoinLogoMap[symbol] ?? "",
  };
}

export function isValidDepositSelection(symbol: string, networkKey: string): boolean {
  return !!findDepositTokenChain(symbol, networkKey);
}
