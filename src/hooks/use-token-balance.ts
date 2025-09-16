import { useEffect, useState } from "react";
import useWalletsStore, { type WalletType } from "@/stores/use-wallets";
import Big from "big.js";
import useBalancesStore, { type BalancesState } from "@/stores/use-balances";

export default function useTokenBalance(token: any, isAuto: boolean = true) {
  const [balance, setBalance] = useState("-");
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
        token.contractAddress,
        wallet.account
      );

      const _balance = balance
        ? Big(balance)
            .div(10 ** token.decimals)
            .toString()
        : "-";
      setBalance(_balance);
    } catch (error) {
      console.error(error);
      setBalance("-");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token?.chainType) return;
    const key = `${token.chainType}Balances`;

    balancesStore.set({
      [key]: {
        ...balancesStore[key as keyof BalancesState],
        [token.contractAddress]: balance
      }
    });
  }, [balance]);

  useEffect(() => {
    if (token?.contractAddress && isAuto && wallet?.account) getBalance();
  }, [token, isAuto, wallet?.account]);

  return { balance, loading, getBalance };
}
