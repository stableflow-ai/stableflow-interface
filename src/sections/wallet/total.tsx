import useWalletStore from "@/stores/use-wallet";
import useBalancesStore from "@/stores/use-balances";
import { useMemo } from "react";
import Amount from "@/components/amount";
import Big from "big.js";
import { chainTypes } from "@/config/chains";
import { formatNumber } from "@/utils/format/number";
import Popover from "@/components/popover";

export default function Total() {
  const walletStore = useWalletStore();
  const balancesStore = useBalancesStore();

  const [
    total,
    balanceSummaries,
    balanceSummariesList,
    balanceSummariesListWithBalance,
    hasBalance,
    hasBalanceCount,
    gridTemplateColumns
  ] = useMemo(() => {
    const _balanceSummaries: any = {};
    let _total = Big(0);
    Object.entries(balancesStore).forEach(([key, value]) => {
      if (!key.includes("Balances")) return;
      const chainType = key.split("Balances")[0];
      const currentChain = chainTypes[chainType];
      _balanceSummaries[chainType] = {
        balance: Big(0),
        balanceString: "0.00",
        percent: "0.00",
        color: currentChain?.color,
        name: currentChain?.name,
      };
      Object.entries(value).forEach(([address, value]) => {
        if (value === "-") return;
        if (address.includes("Balance")) return;
        _total = _total.plus(Big(value as string));
        _balanceSummaries[chainType].balance = Big(_balanceSummaries[chainType].balance).plus(Big(value as string));
      });
    });
    const _balanceSummariesList = Object.values(_balanceSummaries);
    const _balanceSummariesListWithBalance = _balanceSummariesList.filter((item: any) => item.balance.gt(0));
    _balanceSummariesList.forEach((item: any) => {
      if (Big(_total).gt(0)) {
        item.percent = Big(item.balance).div(_total).times(100).toFixed(2);
      }
      item.balanceString = formatNumber(item.balance, 2, true, { round: Big.roundDown });
    });

    // Adjust percentages to ensure small balances take at least 1%
    const adjustedPercentages = _balanceSummariesListWithBalance.map((item: any) => {
      const originalPercent = parseFloat(item.percent);
      return originalPercent < 1 ? 1 : originalPercent;
    });

    // Calculate total adjusted percentage and adjustment factor
    const totalAdjustedPercent = adjustedPercentages.reduce((sum, percent) => sum + percent, 0);
    const adjustmentFactor = 100 / totalAdjustedPercent;

    // Apply adjustment factor to ensure total percentage is 100%
    const finalPercentages = adjustedPercentages.map(percent => 
      (percent * adjustmentFactor).toFixed(2)
    );

    return [
      _total,
      _balanceSummaries,
      _balanceSummariesList,
      _balanceSummariesListWithBalance,
      _balanceSummariesListWithBalance.length > 0,
      _balanceSummariesListWithBalance.length,
      finalPercentages.map(percent => percent + "%").join(" ")
    ];
  }, [balancesStore]);

  return (
    <div className="flex flex-col justify-center items-center border-b border-[#EDF0EF] pb-[15px]">
      <img src={walletStore.fromToken?.icon} className="w-[52px] h-[52px]" />
      <span className="text-[14px] font-[500] mt-[4px]">
        {walletStore.fromToken?.symbol}
      </span>
      {total && Big(total).gt(0) ? (
        <Amount amount={total} integerClassName="text-[20px]" />
      ) : (
        <div className="w-[38px] h-[12px] rounded-[6px] bg-[#EDF0F7] mt-[4px]" />
      )}
      <div
        className="w-full h-[4px] px-[25px] grid grid-cols-1 gap-[2px] mt-[30px]"
        style={{
          gridTemplateColumns,
        }}
      >
        {balanceSummariesListWithBalance.map((item: any) => (
          <Popover
            key={item.name}
            content={(
              <div className="bg-white flex justify-center items-center gap-[9px] leading-[1] h-[40px] px-[10px] rounded-[8px] shadow-[0_0_6px_0_rgba(0,_0,_0,_0.10)] text-[14px] text-[#444C59] font-[400]">
                <div className="flex items-end gap-[0px]">
                  <div className="font-[500]">
                    {formatNumber(item.balance, 2, false, { round: Big.roundDown, isZeroPrecision: true }).integer}
                  </div>
                  <div className="text-[10px] font-[500] translate-y-[-1px]">
                    {formatNumber(item.balance, 2, false, { round: Big.roundDown, isZeroPrecision: true }).decimal}
                  </div>
                </div>
                <div className="flex items-end gap-[4px]">
                  <div className="text-[10px]">
                    on
                  </div>
                  <div className="">
                    {item.name}
                  </div>
                </div>
              </div>
            )}
            trigger="Hover"
            placement="Top"
            contentClassName="!z-[52]"
            closeDelayDuration={0}
            triggerContainerClassName="h-[4px]"
          >
            <div
              tabIndex={0}
              className="w-full h-[4px] border-[0] outline-0 rounded-[2px] cursor-pointer hover:scale-y-150 max-md:focus:scale-y-150 transition-all duration-150"
              style={{ background: item.color }}
            />
          </Popover>
        ))}
      </div>
    </div>
  );
}
