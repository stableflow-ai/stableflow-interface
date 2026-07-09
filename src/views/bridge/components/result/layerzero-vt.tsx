import useBridgeStore from "@/stores/use-bridge";
import { useDebounceFn } from "ahooks";
import Big from "big.js";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import ResultFeeItem from "./fee-item";
import { Service } from "@/services/constants";
import { VT_FEE_LABEL_MAP } from "@/services/layerzero-vt/config";

const ResultLayerzeroVt = () => {
  const bridgeStore = useBridgeStore();
  const _quoteData = bridgeStore.quoteDataMap.get(Service.LayerzeroVt);

  const [fees, setFees] = useState<Record<string, string>>();

  const feeItems = useMemo(() => {
    if (!fees) return [];

    return Object.entries(VT_FEE_LABEL_MAP)
      .filter(([key]) => fees[key] !== void 0 && fees[key] !== "")
      .map(([key, label]) => ({
        key,
        label,
        value: fees[key],
      }));
  }, [fees]);

  const { run: calculateFees } = useDebounceFn(() => {
    if (
      !bridgeStore.amount
      || !_quoteData?.outputAmount
      || Big(bridgeStore.amount).lte(0)
      || Big(_quoteData?.outputAmount).lte(0)
    ) {
      setFees({});
      return;
    }

    setFees(_quoteData?.fees || {});
  }, { wait: 500 });

  useEffect(() => {
    calculateFees();
  }, [bridgeStore]);

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
            {
              feeItems.map((fee) => (
                <ResultFeeItem
                  key={fee.key}
                  label={fee.label}
                  loading={bridgeStore.getQuoting(Service.LayerzeroVt)}
                >
                  {fee.value}
                </ResultFeeItem>
              ))
            }
          </motion.div>
        )
      }
    </AnimatePresence>
  );
};

export default ResultLayerzeroVt;
