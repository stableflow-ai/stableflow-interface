import useBridgeStore from "@/stores/use-bridge";
import { useConfigStore } from "@/stores/use-config";
import { useDebounceFn } from "ahooks";
import Big from "big.js";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import ResultFeeItem from "./fee-item";
import { Service } from "@/services/constants";

const ResultNative = (props: any) => {
  const { } = props;

  const bridgeStore = useBridgeStore();
  const configStore = useConfigStore();
  const _quoteData = bridgeStore.quoteDataMap.get(Service.Native);

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
        widgetFee: 0,
        liquidityProviderFee: 0,
        slippage,
      });
      return;
    }

    setFees({
      totalFee: _quoteData?.totalFeesUsd,
      widgetFee: _quoteData?.fees?.widgetFeeUsd,
      liquidityProviderFee: _quoteData?.fees?.liquidityProviderFeeUsd,
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
            className="w-full flex flex-col items-stretch gap-2 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ResultFeeItem
              label="Widget fee"
              loading={bridgeStore.getQuoting(Service.Native)}
              isZero={true}
            >
              {fees?.widgetFee}
            </ResultFeeItem>
            <ResultFeeItem
              label="LP fee"
              precision={2}
              loading={bridgeStore.getQuoting(Service.Native)}
              isZero={true}
              isDelete={false}
            >
              {fees?.liquidityProviderFee}
            </ResultFeeItem>
          </motion.div>
        )
      }
    </AnimatePresence>
  );
};

export default ResultNative;
