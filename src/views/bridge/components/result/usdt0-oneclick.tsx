import useBridgeStore from "@/stores/use-bridge";
import { useConfigStore } from "@/stores/use-config";
import { useDebounceFn } from "ahooks";
import Big from "big.js";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import ResultFeeItem from "./fee-item";
import { Service } from "@/services/constants";
import { formatNumber } from "@/utils/format/number";

const ResultUsdt0OneClick = (props: any) => {
  const { service } = props;

  const bridgeStore = useBridgeStore();
  const configStore = useConfigStore();
  const _quoteData = bridgeStore.quoteDataMap.get(service);

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
        bridgeFee: "0.01%",
        bridgeFeeValue: 0,
        netFee: 0,
        slippage,
      });
      return;
    }

    setFees({
      totalFee: _quoteData?.totalFeesUsd,
      messagingFee: _quoteData?.fees?.nativeFeeUsd,
      messagingFeeAmount: _quoteData?.fees?.nativeFee,
      messagingFeeUnit: service === Service.OneClickUsdt0 ? _quoteData?.quoteParam?.middleToken?.nativeToken?.symbol : _quoteData?.quoteParam?.fromToken?.nativeToken?.symbol,
      legacyMeshFee: _quoteData?.fees?.legacyMeshFeeUsd,
      estimatedSourceGas: _quoteData?.fees?.estimateGasUsd,
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
            {
              !!fees?.legacyMeshFee && Big(fees?.legacyMeshFee).gt(0) && (
                <ResultFeeItem
                  label="Legacy Mesh Fee"
                  loading={bridgeStore.quotingMap.get(service)}
                >
                  {fees?.legacyMeshFee}
                </ResultFeeItem>
              )
            }
            <ResultFeeItem
              label="Messaging Fee"
              isFormat={false}
              loading={bridgeStore.quotingMap.get(service)}
            >
              {formatNumber(fees?.messagingFeeAmount, 6, true)} {fees?.messagingFeeUnit} ({formatNumber(fees?.messagingFee, 2, true, { prefix: "$" })})
            </ResultFeeItem>
            <ResultFeeItem
              label="Net fee"
              loading={bridgeStore.quotingMap.get(service)}
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
              loading={bridgeStore.quotingMap.get(service)}
              isDelete
            >
              {fees?.bridgeFeeValue}
            </ResultFeeItem>
          </motion.div>
        )
      }
    </AnimatePresence>
  );
};

export default ResultUsdt0OneClick;
