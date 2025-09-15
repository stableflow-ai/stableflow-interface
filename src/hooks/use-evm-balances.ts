import useWalletsStore from "@/stores/use-wallets";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  evmBalancesTokens,
  usdcAddresses,
  usdtAddresses
} from "@/config/tokens";
import Big from "big.js";
import useBalancesStore from "@/stores/use-balances";

export default function useEvmBalances() {
  const [loading, setLoading] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState("0");
  const [usdtBalance, setUsdtBalance] = useState("0");
  const [balances, setBalances] = useState<any>({});
  const wallets = useWalletsStore();
  const balancesStore = useBalancesStore();
  const wallet = wallets.evm;
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

      setUsdcBalance(usdcBalance.toString());
      setUsdtBalance(usdtBalance.toString());

      setBalances(_balances);

      setLoading(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    balancesStore.set({
      evmBalances: {
        ...balancesStore.evmBalances,
        ...balances,
        usdcBalance,
        usdtBalance
      }
    });
  }, [balances, usdcBalance, usdtBalance]);

  useEffect(() => {
    if (!wallet?.account) {
      clearTimeout(window.updateEvmBalancesTimer);
      return;
    }
    const loop = async () => {
      await getBalances();
      window.updateEvmBalancesTimer = setTimeout(() => {
        loop();
      }, 5000);
    };

    loop();

    return () => {
      clearTimeout(window.updateEvmBalancesTimer);
    };
  }, [wallet?.account]);

  return { loading, getBalances };
}
