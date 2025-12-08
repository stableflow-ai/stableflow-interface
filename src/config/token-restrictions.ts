/**
 * Token Chain Restrictions Configuration
 * 
 * Defines disabled rules for token and chain combinations
 * Format: { fromTokenSymbol: { toTokenSymbol: [chainNames] } }
 */
export const tokenRestrictions: Record<string, Record<string, string[]>> = {
  USDC: {
    USDT: ["Berachain"]
  }
};

/**
 * Check if a chain is disabled for a token combination
 * @param fromTokenSymbol - Symbol of the from token
 * @param toTokenSymbol - Symbol of the to token  
 * @param chainName - Name of the chain
 * @returns Whether the chain is disabled
 */
export function isChainDisabled(
  fromTokenSymbol: string | undefined,
  toTokenSymbol: string | undefined,
  chainName: string
): boolean {
  if (!fromTokenSymbol || !toTokenSymbol) {
    return false;
  }

  const restrictions = tokenRestrictions[fromTokenSymbol];
  if (!restrictions) {
    return false;
  }

  const disabledChains = restrictions[toTokenSymbol];
  if (!disabledChains) {
    return false;
  }

  return disabledChains.includes(chainName);
}
