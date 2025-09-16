import useWalletStore from "@/stores/use-wallet";
import useBalancesStore from "@/stores/use-balances";
import { useMemo } from "react";
import Amount from "@/components/amount";
import Big from "big.js";

export default function Total() {
  const walletStore = useWalletStore();
  const balancesStore = useBalancesStore();

  const [total] = useMemo(() => {
    let _total = Big(0);
    Object.entries(balancesStore).forEach(([key, value]) => {
      if (!key.includes("Balances")) return;
      Object.entries(value).forEach(([address, value]) => {
        if (value === "-") return;
        if (address.includes("Balance")) return;
        _total = _total.plus(Big(value as string));
      });
    });

    return [_total.toFixed(2)];
  }, [balancesStore]);
  return (
    <div className="flex flex-col justify-center items-center border-b border-[#EDF0EF] pb-[15px]">
      <img src={walletStore.fromToken?.icon} className="w-[52px] h-[52px]" />
      <span className="text-[14px] font-[500] mt-[4px]">
        {walletStore.fromToken?.symbol}
      </span>
      {total ? (
        <Amount amount={total} integerClassName="text-[20px]" />
      ) : (
        <div className="w-[38px] h-[12px] rounded-[6px] bg-[#EDF0F7] mt-[4px]" />
      )}
    </div>
  );
}
