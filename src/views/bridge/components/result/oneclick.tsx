import useBridgeStore from "@/stores/use-bridge";
import { useConfigStore } from "@/stores/use-config";
import { useDebounceFn } from "ahooks";
import Big from "big.js";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import ResultFeeItem from "./fee-item";
import clsx from "clsx";
import { Service } from "@/services";

const LargeTransactionTip = "Large transactions can take a bit longer to process — usually no more than 3-5 minutes.";

const ResultOneClick = (props: any) => {
  const { } = props;

  const bridgeStore = useBridgeStore();
  const configStore = useConfigStore();
  const _quoteData = bridgeStore.quoteDataMap.get(Service.OneClick);

  const [fees, setFees] = useState<any>();

  const { run: calculateFees } = useDebounceFn(() => {
    const slippage = Big(configStore.slippage).toFixed(2) + "%";
    // No bridge fee will be charged temporarily
    // const bridgeFee = BridgeFee.reduce((acc, item) => {
    //   return acc.plus(Big(item.fee).div(100));
    // }, Big(0)).toFixed(2) + "%";

    if (
      !bridgeStore.amount
      || !_quoteData?.quote?.amountOutFormatted
      || Big(bridgeStore.amount).lte(0)
      || Big(_quoteData?.quote?.amountOutFormatted).lte(0)
    ) {
      setFees({
        totalFee: 0,
        bridgeFee: "0.01%",
        bridgeFeeValue: 0,
        netFee: 0,
        slippage,
      });
      return;
    }

    setFees({
      totalFee: _quoteData?.totalFeesUsd,
      bridgeFee: "0.01%",
      bridgeFeeValue: Big(bridgeStore.amount).times(Big(1).div(10000)),
      netFee: _quoteData?.fees?.destinationGasFeeUsd,
      slippage,
    });
  }, { wait: 500 });

  useEffect(() => {
    calculateFees();
  }, [bridgeStore, configStore.slippage]);

  return (
    <AnimatePresence>
      {
        bridgeStore.showFee && (
          <motion.div
            key="fee-detail"
            className="w-full flex flex-col items-stretch gap-[8px] px-[10px] overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <ResultFeeItem
              label="Net fee"
              loading={bridgeStore.quotingMap.get(Service.OneClick)}
            >
              {fees?.netFee}
            </ResultFeeItem>
            <ResultFeeItem
              label={(
                <>
                  Bridge fee<span className="line-through [text-decoration-color:#F00]">({fees?.bridgeFee})</span>
                </>
              )}
              precision={2}
              loading={bridgeStore.quotingMap.get(Service.OneClick)}
              isDelete
            >
              {fees?.bridgeFeeValue}
            </ResultFeeItem>
            {/* <ResultFeeItem 
            label="Swap Slippage"
             precision={2} 
             loading={bridgeStore.quotingMap.get(Service.OneClick)} 
             isFormat={false}
             >
            {fees?.slippage}
          </ResultFeeItem> */}
          </motion.div>
        )
      }
      {
        Big(bridgeStore.amount || 0).gte(100000) && (
          <motion.div
            key="duration"
            className={clsx("w-full px-[10px] text-[#70788A] text-[12px] font-[400] leading-[120%]", bridgeStore.showFee && "mt-[8px]")}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {LargeTransactionTip}
          </motion.div>
        )
      }
    </AnimatePresence>
  );
};

export default ResultOneClick;
