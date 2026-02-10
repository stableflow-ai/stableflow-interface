import useBridgeStore from "@/stores/use-bridge";
import { useConfigStore } from "@/stores/use-config";
import { useDebounceFn } from "ahooks";
import Big from "big.js";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import ResultFeeItem from "./fee-item";
import { Service } from "@/services/constants";

const ResultCCTP = (props: any) => {
  const { } = props;

  const bridgeStore = useBridgeStore();
  const configStore = useConfigStore();
  const _quoteData = bridgeStore.quoteDataMap.get(Service.CCTP);

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
        mintGasFee: 0,
        bridgeFee: 0,
        slippage,
      });
      return;
    }

    setFees({
      totalFee: _quoteData?.totalFeesUsd,
      mintGasFee: _quoteData?.fees?.estimateMintGasUsd,
      bridgeFee: _quoteData?.fees?.bridgeFeeUsd,
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
              label="Bridge fee"
              loading={bridgeStore.quotingMap.get(Service.CCTP)}
            >
              {fees?.bridgeFee}
            </ResultFeeItem>
            <ResultFeeItem
              label="Mint Gas fee"
              precision={2}
              loading={bridgeStore.quotingMap.get(Service.CCTP)}
            >
              {fees?.mintGasFee}
            </ResultFeeItem>
          </motion.div>
        )
      }
    </AnimatePresence>
  );
};

export default ResultCCTP;
