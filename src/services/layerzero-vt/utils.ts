import Big from "big.js";
import { numberRemoveEndZero } from "@/utils/format/number";
import type { VtQuote } from "./types";

export interface VtQuoteToken {
  chainKey: string;
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  price?: { usd: number; };
}

const EXCLUDE_TOTAL_FEE_KEYS = ["estimateGasUsd"];

const toDescriptionFeeKey = (description: string, type: string) => {
  const normalized = (description || type).replace(/\s+/g, "");
  return normalized ? `${normalized}Usd` : "feeUsd";
};

const buildUniqueFeeKey = (description: string, type: string, index: number, usedKeys: Set<string>) => {
  const baseKey = toDescriptionFeeKey(description, type);
  let key = baseKey;
  let suffix = 1;

  while (usedKeys.has(key)) {
    key = `${baseKey.replace(/Usd$/, "")}${suffix}Usd`;
    suffix += 1;
  }

  if (usedKeys.has(key)) {
    key = `${baseKey.replace(/Usd$/, "")}${index}Usd`;
  }

  usedKeys.add(key);
  return key;
};

const buildTokenLookup = (tokens: VtQuoteToken[] = []) => {
  const lookup = new Map<string, VtQuoteToken>();

  for (const token of tokens) {
    lookup.set(`${token.chainKey}:${token.address.toLowerCase()}`, token);
  }

  return lookup;
};

export const buildVtFeesFromQuote = (
  quoteFees: VtQuote["fees"] = [],
  tokens: VtQuoteToken[] = [],
  fallbackFeeUsd?: string,
) => {
  const fees: Record<string, string> = {
    estimateGasUsd: "0",
  };
  const usedKeys = new Set<string>(EXCLUDE_TOTAL_FEE_KEYS);
  const tokenLookup = buildTokenLookup(tokens);

  quoteFees.forEach((fee, index) => {
    const token = tokenLookup.get(`${fee.chainKey}:${fee.address.toLowerCase()}`);
    const decimals = token?.decimals ?? 18;
    const priceUsd = token?.price?.usd ?? 0;
    const amountFormatted = numberRemoveEndZero(
      Big(fee.amount || 0).div(10 ** decimals).toFixed(decimals, 0)
    );
    const amountUsd = numberRemoveEndZero(
      Big(amountFormatted || 0).times(priceUsd).toFixed(6, 0)
    );
    const key = buildUniqueFeeKey(fee.description, fee.type, index, usedKeys);

    fees[key] = amountUsd;
  });

  if (Object.keys(fees).length === 1 && fallbackFeeUsd) {
    fees.bridgeFeeUsd = fallbackFeeUsd;
  }

  return fees;
};

export const calculateVtTotalFeesUsd = (fees: Record<string, unknown>) => {
  let total = Big(0);

  for (const feeKey in fees) {
    if (EXCLUDE_TOTAL_FEE_KEYS.includes(feeKey) || !/Usd$/.test(feeKey)) {
      continue;
    }

    const feeValue = fees[feeKey];
    if (typeof feeValue !== "string" && typeof feeValue !== "number") {
      continue;
    }

    total = total.plus(feeValue || 0);
  }

  return numberRemoveEndZero(total.toFixed(20));
};
