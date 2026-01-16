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
    debouncedGetBalances();

    // Start polling balances
    startPollingBalances();

    return () => {
      stopPollingBalances();
    };
  }, [wallet?.account, auto]);

  return { loading, getBalances };
}
