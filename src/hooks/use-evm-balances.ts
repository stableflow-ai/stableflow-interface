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

export default function useEvmBalances(auto = false) {
  const [loading, setLoading] = useState(false);

  const wallets = useWalletsStore();
  const balancesStore = useBalancesStore();
  const wallet = wallets.evm;
  const initRef = useRef(false);

  const getBalances = async () => {
    if (!wallet || !wallet.account) return;
    try {
      setLoading(true);
      const res = await axios.post("https://api.db3.app/api/balance/tokens", {
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
    }
  };

  const fetchBalances = async () => {
    if (!wallet?.account) {
      clearTimeout(window.updateEvmBalancesTimer);
      return;
    }
    const loop = async () => {
      await getBalances();
      if (!auto) return;
      window.updateEvmBalancesTimer = setTimeout(() => {
        loop();
      }, 5000);
    };

    loop();
  };

  const { run: debouncedGetBalances } = useDebounceFn(fetchBalances, {
    wait: 5000
  });

  useEffect(() => {
    if (!wallet?.account) {
      clearTimeout(window.updateEvmBalancesTimer);
      return;
    }
    if (!initRef.current) {
      initRef.current = true;
      fetchBalances();
      return;
    }

    debouncedGetBalances();
    return () => {
      clearTimeout(window.updateEvmBalancesTimer);
    };
  }, [wallet?.account, auto]);

  return { loading, getBalances };
}
