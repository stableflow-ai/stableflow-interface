import useWalletStore from "@/stores/use-wallet";
import useBalancesStore from "@/stores/use-balances";
import { useMemo } from "react";
import Amount from "@/components/amount";
import Big from "big.js";
import { chainTypes } from "@/config/chains";
import { formatNumber } from "@/utils/format/number";
import Popover from "@/components/popover";
import clsx from "clsx";
import { stablecoinLogoMap, stablecoinWithChains } from "@/config/tokens";

export default function Total() {
  const walletStore = useWalletStore();
  const balancesStore = useBalancesStore();

  const [
    total,
    _balanceSummaries,
    _balanceSummariesList,
    _balanceSummariesListWithBalance,
    balanceSummariesListWithBalanceFinal,
    _hasBalance,
    _hasBalanceCount,
    gridTemplateColumns
  ] = useMemo(() => {
    const _balanceSummaries: any = {};
    let _total = Big(0);
    Object.entries(balancesStore).forEach(([key, value]) => {
      if (!key.includes("Balances")) return;
      const chainType = key.split("Balances")[0];
      const currentChain = chainTypes[chainType];
      const currentTokenWithChains = stablecoinWithChains[chainType][walletStore.selectedToken];
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
        if (!currentTokenWithChains?.chains?.some((chain: any) => chain.contractAddress === address)) {
          return;
        }
        _total = _total.plus(Big(value as string));
        _balanceSummaries[chainType].balance = Big(_balanceSummaries[chainType].balance).plus(Big(value as string));
      });
    });
    const _balanceSummariesList = Object.values(_balanceSummaries);
    const _balanceSummariesListWithBalance = _balanceSummariesList.filter((item: any) => item.balance.gt(0)).sort((a: any, b: any) => b.balance.minus(a.balance).toNumber());

    _balanceSummariesList.forEach((item: any) => {
      if (Big(_total).gt(0)) {
        item.percent = Big(item.balance).div(_total).times(100).toFixed(2);
      }
      item.balanceString = formatNumber(item.balance, 2, true, { round: Big.roundDown });
    });

    // only show the front 2 items
    // others should be merged into the last item
    const _balanceSummariesListWithBalanceFinalFront = _balanceSummariesListWithBalance.slice(0, 2);
    const _balanceSummariesListWithBalanceFinalOthers = _balanceSummariesListWithBalance.slice(2).reduce((acc: any, item: any) => {
      acc.balance = acc.balance.plus(item.balance);
      acc.balanceString = formatNumber(acc.balance, 2, true, { round: Big.roundDown });
      if (Big(_total).gt(0)) {
        acc.percent = Big(acc.balance).div(_total).times(100).toFixed(2);
      }
      return acc;
    }, {
      balance: Big(0),
      balanceString: "0.00",
      percent: "0.00",
      name: "others",
      color: "#E3E8F3",
    });
    const _balanceSummariesListWithBalanceFinal = [..._balanceSummariesListWithBalanceFinalFront];
    if (_balanceSummariesListWithBalance.slice(2).length > 0) {
      _balanceSummariesListWithBalanceFinal.push(_balanceSummariesListWithBalanceFinalOthers);
    }

    // Adjust percentages to ensure small balances take at least 1%
    const adjustedPercentages = _balanceSummariesListWithBalanceFinal.map((item: any) => {
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
      _balanceSummariesListWithBalanceFinal,
      _balanceSummariesListWithBalance.length > 0,
      _balanceSummariesListWithBalance.length,
      finalPercentages.map(percent => percent + "%").join(" ")
    ];
  }, [balancesStore]);

  return (
    <div className="flex flex-col justify-center items-center border-b border-[#EDF0EF] pb-[40px] mt-[20px]">
      <div className="w-full px-[18px] flex items-center gap-[7px]">
        <div className="flex flex-col gap-[0px] text-black text-[14px] font-[500] leading-[100%]">
          <div className="">
            Total {walletStore.selectedToken}
          </div>
          {total && Big(total).gt(0) ? (
            <Amount
              amount={total}
              className="mt-[4px]"
              integerClassName="text-[20px] text-black"
              decimalClassName="text-[10px] text-black"
            />
          ) : (
            <div className="w-[71px] h-[12px] rounded-[6px] bg-[#EDF0F7] mt-[4px]" />
          )}
        </div>
      </div>
      <div
        className="w-full h-[16px] px-[25px] grid grid-cols-1 gap-[2px] mt-[30px]"
        style={{
          gridTemplateColumns,
        }}
      >
        {balanceSummariesListWithBalanceFinal.map((item: any, index: number) => {
          const lastIndex = balanceSummariesListWithBalanceFinal.length - 1;
          return (
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
              placement={[0, lastIndex].includes(index) ? "Bottom" : "Top"}
              contentClassName="!z-[52]"
              closeDelayDuration={0}
              triggerContainerClassName="h-full"
            >
              <div className="relative w-full h-full">
                <div
                  tabIndex={0}
                  className="w-full h-full rounded-[2px] cursor-pointer hover:scale-y-[1.25] max-md:focus:scale-y-[1.25] transition-all duration-150"
                  style={{ background: item.color }}
                />
                <div
                  className={clsx(
                    "w-[1px] h-[24px] absolute z-[1]",
                    [0, lastIndex].includes(index) ? "top-[-25px]" : "bottom-[-25px]",
                    index === lastIndex ? "right-0" : "left-0",
                  )}
                  style={{ background: item.color }}
                >
                  <div
                    className={clsx(
                      "text-[#9FA7BA] text-[10px] absolute z-[1]",
                      [0, lastIndex].includes(index) ? "top-[-4px]" : "bottom-[8px]",
                      index === lastIndex ? "left-0 -translate-x-[calc(100%+2px)]" : "right-0 translate-x-[calc(100%+2px)]",
                    )}
                  >
                    {item.name}
                  </div>
                  <div
                    className={clsx(
                      "text-[10px] absolute z-[1]",
                      [0, lastIndex].includes(index) ? "top-[8px]" : "bottom-[-4px]",
                      index === lastIndex ? "left-0 -translate-x-[calc(100%+2px)]" : "right-0 translate-x-[calc(100%+2px)]",
                    )}
                    style={{ color: item.color }}
                  >
                    {item.percent}%
                  </div>
                </div>
              </div>
            </Popover>
          );
        })}
      </div>
    </div>
  );
}
