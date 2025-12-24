import useBridgeStore from "@/stores/use-bridge";
import { useConfigStore } from "@/stores/use-config";
import { useDebounceFn } from "ahooks";
import Big from "big.js";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import ResultFeeItem from "./fee-item";
import { Service } from "@/services";
import { formatNumber } from "@/utils/format/number";

const ResultUsdt0 = (props: any) => {
  const { } = props;

  const bridgeStore = useBridgeStore();
  const configStore = useConfigStore();
  const _quoteData = bridgeStore.quoteDataMap.get(Service.Usdt0);

  const [fees, setFees] = useState<any>();

  const { run: calculateFees } = useDebounceFn(() => {
    const slippage = Big(configStore.slippage).toFixed(2) + "%";

    if (
      !bridgeStore.amount
      || !_quoteData?.outputAmount
      || Big(bridgeStore.amount).lte(0)
      || Big(_quoteData?.outputAmount).lte(0)
    ) {
      setFees({
        totalFee: 0,
        messagingFee: 0,
        messagingFeeAmount: 0,
        messagingFeeUnit: "",
        legacyMeshFee: 0,
        estimatedSourceGas: 0,
        slippage,
      });
      return;
    }

    setFees({
      totalFee: _quoteData?.totalFeesUsd,
      messagingFee: _quoteData?.fees?.nativeFeeUsd,
      messagingFeeAmount: _quoteData?.fees?.nativeFee,
      messagingFeeUnit: _quoteData?.quoteParam?.fromToken?.nativeToken?.symbol,
      legacyMeshFee: _quoteData?.fees?.legacyMeshFeeUsd,
      estimatedSourceGas: _quoteData?.fees?.estimateGasUsd,
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
            {
              !!fees?.legacyMeshFee && Big(fees?.legacyMeshFee).gt(0) && (
                <ResultFeeItem
                  label="Legacy Mesh Fee"
                  loading={bridgeStore.quotingMap.get(Service.Usdt0)}
                >
                  {fees?.legacyMeshFee}
                </ResultFeeItem>
              )
            }
            <ResultFeeItem
              label="Messaging Fee"
              isFormat={false}
              loading={bridgeStore.quotingMap.get(Service.Usdt0)}
            >
              {formatNumber(fees?.messagingFeeAmount, 2, true)} {fees?.messagingFeeUnit} ({formatNumber(fees?.messagingFee, 2, true, { prefix: "$" })})
            </ResultFeeItem>
            {/* <ResultFeeItem 
            label="Swap Slippage"
             precision={2} 
             loading={bridgeStore.quotingMap.get(Service.Usdt0)} 
             isFormat={false}
             >
          {fees?.slippage}
        </ResultFeeItem> */}
          </motion.div>
        )
      }
    </AnimatePresence>
  );
};

export default ResultUsdt0;
