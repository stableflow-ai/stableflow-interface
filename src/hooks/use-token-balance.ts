import { useEffect, useState } from "react";
import useWalletsStore, { type WalletType } from "@/stores/use-wallets";
import Big from "big.js";
import useBalancesStore from "@/stores/use-balances";

export default function useTokenBalance(token: any, isAuto: boolean = true) {
  const [balance, setBalance] = useState("-");
  const [loading, setLoading] = useState(false);
  const wallets = useWalletsStore();
  const balancesStore = useBalancesStore();

  const getBalance = async () => {
    if (!token?.chainType) return;
    const wallet = wallets[token.chainType as WalletType];
    if (!wallet) return;
    try {
      setLoading(true);
      const balance = await wallet.wallet.balanceOf(
        token.contractAddress,
        wallet.account
      );
      const _balance = Big(balance)
        .div(10 ** token.decimals)
        .toString();
      setBalance(_balance);
    } catch (error) {
      console.error(error);
      setBalance("-");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    balancesStore.set({
      balances: {
        ...balancesStore.balances,
        [token.contractAddress]: balance
      }
    });
  }, [balance]);

  useEffect(() => {
    if (token?.contractAddress && isAuto) getBalance();
  }, [token, isAuto]);

  return { balance, loading, getBalance };
}
