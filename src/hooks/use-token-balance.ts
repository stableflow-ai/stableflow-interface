import { useEffect, useState } from "react";
import useWalletsStore, { type WalletType } from "@/stores/use-wallets";
import Big from "big.js";
import useBalancesStore, { type BalancesState } from "@/stores/use-balances";

export default function useTokenBalance(token: any, isAuto: boolean = true) {
  const [balance, setBalance] = useState("0");
  const [loading, setLoading] = useState(false);
  const wallets = useWalletsStore();
  const balancesStore = useBalancesStore();
  const wallet = wallets[token?.chainType as WalletType];

  const getBalance = async () => {
    if (!token?.chainType) return;

    if (!wallet?.wallet || !wallet.account) return;

    try {
      setLoading(true);

      const balance = await wallet.wallet?.balanceOf(
        token,
        wallet.account
      );

      const _balance = balance
        ? Big(balance)
          .div(10 ** token.decimals)
          .toString()
        : "0";
      setBalance(_balance);

      const key = `${token.chainType}Balances`;
      let nextBalances = balancesStore[key as keyof BalancesState];

      if (nextBalances[token.chainId || token.blockchain]) {
        nextBalances[token.chainId || token.blockchain][token.contractAddress] = _balance;
      } else {
        nextBalances[token.chainId || token.blockchain] = {
          [token.contractAddress]: _balance,
        };
      }

      balancesStore.set({
        [key]: nextBalances
      });
    } catch (error) {
      console.error(error);
      setBalance("0");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token?.contractAddress && isAuto && wallet?.account) getBalance();
  }, [token, isAuto, wallet?.account]);

  return { balance, loading, getBalance };
}
