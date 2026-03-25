import useWalletsStore from "@/stores/use-wallets";
import { useEffect, useRef } from "react";
import axios from "axios";
import {
  evmBalancesTokens,
  usdcAddresses,
  usdt0Addresses,
  usdtAddresses,
  frxusdAddresses,
  type EvmBalancesToken,
} from "@/config/tokens";
import Big from "big.js";
import useBalancesStore from "@/stores/use-balances";
import { useDebounceFn } from "ahooks";
import { DB3_API_URL } from "@/config/api";
import chains from "@/config/chains";
import { ethers } from "ethers";
import { erc20Abi } from "viem";
import { numberRemoveEndZero } from "@/utils/format/number";
import { csl } from "@/utils/log";
import useWalletStore from "@/stores/use-wallet";

export default function useEvmBalances(auto = false) {
  const wallets = useWalletsStore();
  const balancesStore = useBalancesStore();
  const wallet = wallets.evm;
  const updateEvmBalancesTimer = useRef<any>(null);
  const initRef = useRef(false);
  const walletStore = useWalletStore();
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const setLoading = (loading: boolean) => {
    walletStore.set({ evmBalancesLoading: loading });
  };

  const getBalances = async () => {
    if (!wallet || !wallet.account) return;

    // Cancel the previous unfinished request
    abortControllerRef.current?.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    const currentRequestId = ++requestIdRef.current;

    // Only fetch the balance of the currently selected walletStore.selectedToken
    const _evmBalancesTokens: EvmBalancesToken[] = [];
    for (let i = 0; i < evmBalancesTokens.length; i++) {
      const currentChain = evmBalancesTokens[i];
      let currentTokenIndex = currentChain?.symbols?.indexOf?.(walletStore.selectedToken);
      if (currentChain.chain_id === 1 && walletStore.selectedToken === "USD₮0") {
        currentTokenIndex = currentChain?.symbols?.indexOf?.("USDT");
      }
      if (typeof currentTokenIndex !== "number" || currentTokenIndex < 0) {
        continue;
      }
      _evmBalancesTokens.push({
        chain_id: currentChain.chain_id,
        decimals: [currentChain.decimals[currentTokenIndex]],
        symbols: [currentChain.symbols[currentTokenIndex]],
        tokens: [currentChain.tokens[currentTokenIndex]],
      });
    }

    csl("useEvmBalances", "pink-700", "current selected token: %o", walletStore.selectedToken);
    csl("useEvmBalances", "pink-700", "current balances tokens: %o", _evmBalancesTokens);

    const isRequestStale = () => abortController.signal.aborted || currentRequestId !== requestIdRef.current;

    try {
      setLoading(true);
      const res = await axios.post(`${DB3_API_URL}/balance/tokens`, {
        address: wallet.account,
        tokens: _evmBalancesTokens,
      }, { signal: abortController.signal });
      const _data = res.data.data;
      const _balances: any = {
        ...balancesStore.evmBalances,
      };

      const setBalances = (__data: any, isFinal?: boolean) => {
        if (isRequestStale()) return;
        let usdcBalance = Big(0);
        let usdtBalance = Big(0);
        let usdt0Balance = Big(0);
        let frxusdBalance = Big(0);

        Object.entries(__data).forEach(([key, item]: any) => {
          if (!item) return;
          const currentTokenChain = _evmBalancesTokens.find((token) => Number(token.chain_id) === Number(key));
          item.forEach((sl: any) => {
            const currentTokenIndex = currentTokenChain?.tokens?.map?.((address) => address.toLowerCase())?.indexOf?.(sl.address.toLowerCase());
            let currentTokenDecimals = 6;
            if (currentTokenChain && typeof currentTokenIndex === "number" && currentTokenIndex > -1) {
              currentTokenDecimals = currentTokenChain.decimals[currentTokenIndex];
            }
            const _balance = Big(sl.balance).div(10 ** currentTokenDecimals);
            if (Object.values(usdcAddresses).includes(sl.address.toLowerCase())) {
              usdcBalance = usdcBalance.plus(_balance);
            }
            if (Object.values(usdtAddresses).includes(sl.address.toLowerCase())) {
              usdtBalance = usdtBalance.plus(_balance);
            }
            if (Object.values(usdt0Addresses).includes(sl.address.toLowerCase())) {
              usdt0Balance = usdt0Balance.plus(_balance);
            }
            if (Object.values(frxusdAddresses).includes(sl.address.toLowerCase())) {
              frxusdBalance = frxusdBalance.plus(_balance);
            }

            if (_balances[key]) {
              _balances[key][sl.address] = _balance.toString();
            } else {
              _balances[key] = {
                [sl.address]: _balance.toString()
              };
            }
          });
        });

        const selectedTotalBalance = {
          "USDT": { usdtBalance: (isFinal || Big(_balances.usdtBalance || 0).lte(0)) ? usdtBalance.toString() : _balances.usdtBalance, },
          "USDC": { usdcBalance: (isFinal || Big(_balances.usdcBalance || 0).lte(0)) ? usdcBalance.toString() : _balances.usdcBalance, },
          "USD₮0": { "usd₮0Balance": (isFinal || Big(_balances["usd₮0Balance"] || 0).lte(0)) ? usdt0Balance.toString() : _balances["usd₮0Balance"], },
          "frxUSD": { frxusdBalance: (isFinal || Big(_balances.frxusdBalance || 0).lte(0)) ? frxusdBalance.toString() : _balances.frxusdBalance, },
        };

        if (wallet?.account) {
          balancesStore.set({
            evmBalances: {
              ..._balances,
              ...selectedTotalBalance[walletStore.selectedToken],
            },
          });
        }
      };

      setBalances(_data);

      const unsupportedChainIds = _evmBalancesTokens.map((token) => Object.keys(_data).includes(token.chain_id.toString()) ? null : token.chain_id).filter(Boolean);
      const unsupportedBalances: any = {};
      csl("useEvmBalances", "pink-700", "unsupportedChainIds: %o", unsupportedChainIds);
      // get unsupported tokens balances from provider (fully concurrent)
      const allBalancePromises: Array<{ chainId: number; promise: Promise<{ address: string; decimals: number; balance: string; format: string }> }> = [];
      for (const token of _evmBalancesTokens) {
        const _token: any = token;
        if (!unsupportedChainIds.includes(_token.chain_id)) continue;
        const currentChain: any = Object.values(chains).find((chain: any) => chain.chainId === _token.chain_id);
        if (!currentChain) continue;

        const providers = currentChain.rpcUrls.map((rpc: string) => new ethers.JsonRpcProvider(rpc, currentChain.chainId));
        const provider = new ethers.FallbackProvider(providers);

        for (const address of _token.tokens) {
          const promise = (async () => {
            const _result = {
              address,
              decimals: 6,
              balance: "0",
              format: "0",
            };
            try {
              const contract = new ethers.Contract(address, erc20Abi, provider);
              const decimals = await contract.decimals();
              const balance = await contract.balanceOf(wallet.account);

              _result.decimals = Number(decimals);
              _result.balance = balance.toString();
              _result.format = numberRemoveEndZero(Big(_result.balance).div(10 ** _result.decimals).toFixed(_result.decimals));
            } catch (error) { }

            return _result;
          })();
          allBalancePromises.push({ chainId: _token.chain_id, promise });
        }
      }

      const allResults = await Promise.allSettled(allBalancePromises.map(({ promise }) => promise));
      for (let i = 0; i < allBalancePromises.length; i++) {
        if (isRequestStale()) break;
        const { chainId } = allBalancePromises[i];
        const result = allResults[i];
        if (result.status === "fulfilled") {
          if (!unsupportedBalances[chainId]) unsupportedBalances[chainId] = [];
          unsupportedBalances[chainId].push(result.value);
        }
      }
      csl("useEvmBalances", "pink-700", "unsupportedBalances: %o", unsupportedBalances);

      for (const chainId in unsupportedBalances) {
        if (!_data[chainId]) {
          _data[chainId] = unsupportedBalances[chainId];
        }
      }

      setBalances(_data, true);

      if (!isRequestStale()) setLoading(false);
    } catch (error) {
      if (axios.isCancel(error) || (error instanceof Error && error.name === "AbortError")) return;
      csl("useEvmBalances", "red-500", "get balances failed: %o", error);
    } finally {
      if (!isRequestStale()) setLoading(false);
      initRef.current = true;
    }
  };

  const stopPollingBalances = () => {
    if (updateEvmBalancesTimer.current) {
      clearTimeout(updateEvmBalancesTimer.current);
      updateEvmBalancesTimer.current = null;
    }
  };

  const startPollingBalances = async () => {
    updateEvmBalancesTimer.current = setInterval(() => {
      getBalances();
      // 1 minute
    }, 1000 * 60);
  };

  const { run: debouncedGetBalances, cancel: cancelDebouncedGetBalances } = useDebounceFn(getBalances, {
    wait: 5000
  });

  useEffect(() => {
    if (!wallet?.account) {
      return;
    }

    if (!initRef.current) {
      debouncedGetBalances();
    }
  }, [wallet?.account, walletStore.selectedToken]);

  useEffect(() => {
    if (!wallet?.account || !auto) {
      stopPollingBalances();

      if (initRef.current) {
        cancelDebouncedGetBalances();
      }
      return;
    }

    // Initial request
    getBalances();

    // Start polling balances
    startPollingBalances();

    return () => {
      stopPollingBalances();
    };
  }, [wallet?.account, auto, walletStore.selectedToken]);

  return { loading: walletStore.evmBalancesLoading, getBalances };
}
