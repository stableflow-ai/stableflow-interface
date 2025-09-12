import { useEffect, useState } from "react";
import useWalletsStore, { type WalletType } from "@/stores/use-wallets";
import Big from "big.js";

export default function useTokenBalance(token: any) {
  const [balance, setBalance] = useState("-");
  const [loading, setLoading] = useState(false);
  const wallets = useWalletsStore();

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

      setBalance(
        Big(balance)
          .div(10 ** token.decimals)
          .toString()
      );
    } catch (error) {
      console.error(error);
      setBalance("-");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) getBalance();
  }, [token]);

  return { balance, loading };
}
