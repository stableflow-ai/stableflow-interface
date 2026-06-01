import type { TokenChain } from "@/config/chains";
import { stablecoinWithChains } from "@/config/tokens";
import type { BalancesState } from "@/stores/use-balances";
import Big from "big.js";

export function buildDepositQrValue(token: TokenChain, address: string): string {
  const trimmed = address.trim();
  // if (token.chainType === "evm" && token.chainId) {
  //   return `ethereum:${trimmed}@${token.chainId}`;
  // }
  return trimmed;
}

export function getTokenTotalBalance(
  symbol: string,
  balancesStore: BalancesState
): Big {
  let total = Big(0);

  Object.entries(balancesStore).forEach(([key, value]) => {
    if (!key.includes("Balances") || typeof value !== "object" || !value) return;

    const chainType = key.split("Balances")[0];
    const currentTokenWithChains = stablecoinWithChains[chainType]?.[symbol];
    if (!currentTokenWithChains?.chains) return;

    Object.entries(value).forEach(([blockchain, balances]) => {
      if (blockchain.includes("Balance")) return;
      if (typeof balances !== "object" || !balances) return;

      Object.entries(balances).forEach(([address, balance]) => {
        if (
          !currentTokenWithChains.chains.some(
            (chain: TokenChain) => chain.contractAddress === address
          )
        ) {
          return;
        }
        total = total.plus(Big(balance as string));
      });
    });
  });

  return total;
}

export function getNetworkBalance(
  tokenChain: TokenChain,
  balancesStore: BalancesState
): string | undefined {
  const key = `${tokenChain.chainType}Balances` as keyof BalancesState;
  const chainBalances = balancesStore[key];
  if (!chainBalances || typeof chainBalances !== "object") return undefined;

  const blockchainKey = tokenChain.chainId ?? tokenChain.blockchain;
  const balances = (chainBalances as Record<string, Record<string, string>>)[
    blockchainKey
  ];
  return balances?.[tokenChain.contractAddress];
}

export function downloadQrCode(canvas: HTMLCanvasElement, filename: string) {
  const url = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
}
