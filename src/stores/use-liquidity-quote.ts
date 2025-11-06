import { useRequest } from "ahooks";
import axios from "axios";
import useWalletStore from "./use-wallet";
import useBridgeStore from "./use-bridge";
import chains from "@/config/chains";
import { useMemo } from "react";
import Big from "big.js";
import { BASE_API_URL } from "@/config/api";

export function useLiquidityQuote() {
  const walletStore = useWalletStore();
  const bridgeStore = useBridgeStore();

  const { data: liquidityQuote, loading: liquidityQuoteLoading, runAsync: getLiquidityQuote } = useRequest(async () => {
    try {
      const res = await axios.get(`${BASE_API_URL}/v1/nearintents/quote`);
      if (res.status !== 200 || res.data?.code !== 200) {
        console.log("get liquidity quote failed: %o", res);
        return;
      }
      return res.data.data;
    } catch (error) {
      console.log("get liquidity quote failed: %o", error);
    }
  }, {
    // 30 mins
    pollingInterval: 30 * 60 * 1000,
  });

  const [fromToken, toToken] = useMemo(() => {
    return [
      walletStore.fromToken,
      walletStore.toToken,
    ];
  }, [
    walletStore.fromToken,
    walletStore.toToken,
  ]);

  const [amount] = useMemo(() => {
    return [bridgeStore.amount];
  }, [bridgeStore.amount]);

  const liquidityError = useMemo(() => {
    if (!amount || Big(amount).lte(0)) {
      return false;
    }
    if (!fromToken || !toToken) {
      return false;
    }
    if (!liquidityQuote || !liquidityQuote.data) {
      return false;
    }
    const fromChain = ChainsMap[fromToken.chainName];
    const toChain = ChainsMap[toToken.chainName];
    if (!fromChain || !toChain) {
      return false;
    }
    const quoteChainKey = `${fromChain}_${toChain}`;
    const getAmountKey = () => {
      if (Big(amount).gte(1000000)) {
        return "1000000";
      }
      if (Big(amount).gte(10000)) {
        return "10000";
      }
      if (Big(amount).gte(100)) {
        return "100";
      }
      return "1";
    };
    const quoteKey = `${quoteChainKey}_${getAmountKey()}`;
    const quote = liquidityQuote.data[quoteKey];
    if (typeof quote !== "boolean") {
      return false;
    }
    return !quote;
  }, [
    fromToken,
    toToken,
    amount,
    liquidityQuote,
  ]);

  return {
    liquidityError,
    liquidityQuote,
    liquidityQuoteLoading,
    getLiquidityQuote,
  };
}

const ChainsMap: Record<string, string> = {
  [chains.arb.chainName]: "Arb",
  [chains.avax.chainName]: "Avax",
  [chains.bsc.chainName]: "Bsc",
  [chains.eth.chainName]: "ETH",
  [chains.op.chainName]: "Op",
  [chains.pol.chainName]: "Pol",
  [chains.near.chainName]: "Near",
  [chains.sol.chainName]: "Sol",
  [chains.tron.chainName]: "Tron",
};
