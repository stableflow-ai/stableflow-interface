import useWalletsStore from "@/stores/use-wallets";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  evmBalancesTokens,
  usdcAddresses,
  usdtAddresses
} from "@/config/tokens";
import Big from "big.js";
import useBalancesStore from "@/stores/use-balances";
import { useDebounceFn } from "ahooks";
import { DB3_API_URL } from "@/config/api";
import chains from "@/config/chains";
import { ethers } from "ethers";
import { erc20Abi } from "viem";
import { numberRemoveEndZero } from "@/utils/format/number";

export default function useEvmBalances(auto = false) {
  const [loading, setLoading] = useState(false);

  const wallets = useWalletsStore();
  const balancesStore = useBalancesStore();
  const wallet = wallets.evm;
  const updateEvmBalancesTimer = useRef<any>(null);
  const initRef = useRef(false);

  const getBalances = async () => {
    if (!wallet || !wallet.account) return;
    try {
      setLoading(true);
      const res = await axios.post(`${DB3_API_URL}/balance/tokens`, {
        address: wallet.account,
        tokens: evmBalancesTokens
      });
      const _balances: any = {};
      const _data = res.data.data;

      const unsupportedChainIds = evmBalancesTokens.map((token: any) => Object.keys(_data).includes(token.chain_id.toString()) ? null : token.chain_id).filter(Boolean);
      const unsupportedBalances: any = {};
      // get unsupported tokens balances from provider
      for (const token of evmBalancesTokens) {
        const _token: any = token;
        if (unsupportedChainIds.includes(_token.chain_id)) {
          const currentChain = Object.values(chains).find((chain: any) => chain.chainId === _token.chain_id);
          if (!currentChain) {
            return;
          }

          const provider = new ethers.JsonRpcProvider(currentChain.rpcUrl);

          const balancePromises = _token.tokens.map(async (address: string) => {
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
          });

          const balances = await Promise.all(balancePromises);
          unsupportedBalances[_token.chain_id] = balances;
        }
      }

      for (const chainId in unsupportedBalances) {
        if (!_data[chainId]) {
          _data[chainId] = unsupportedBalances[chainId];
        }
      }

      let usdcBalance = Big(0);
      let usdtBalance = Big(0);

      Object.entries(_data).forEach(([key, item]: any) => {
        if (!item) return;
        item.forEach((sl: any) => {
          const _balance = Big(sl.balance).div(
            10 ** (Number(key) === 56 ? 18 : 6)
          );
          if (usdcAddresses.includes(sl.address)) {
            usdcBalance = usdcBalance.plus(_balance);
          }
          if (usdtAddresses.includes(sl.address)) {
            usdtBalance = usdtBalance.plus(_balance);
          }
          _balances[sl.address] = _balance.toString();
        });
      });

      if (wallet?.account) {
        balancesStore.set({
          evmBalances: {
            ..._balances,
            usdcBalance: usdcBalance.toString(),
            usdtBalance: usdtBalance.toString()
          }
        });
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
  }, [wallet?.account]);

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
  }, [wallet?.account, auto]);

  return { loading, getBalances };
}
