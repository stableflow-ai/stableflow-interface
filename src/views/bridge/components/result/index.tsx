import useBridgeStore from "@/stores/use-bridge";
import { formatNumber } from "@/utils/format/number";
import { motion } from "framer-motion";
import { lazy, Suspense, useMemo } from "react";
import { Service, ServiceLogoMap } from "@/services";
import { formatDuration } from "@/utils/format/time";
import ResultUsdt0 from "./usdt0";

const ResultOneClick = lazy(() => import("./oneclick"));

export default function Result() {
  const bridgeStore = useBridgeStore();
  const _quoteData = bridgeStore.quoteDataMap.get(bridgeStore.quoteDataService);

  const duration = useMemo(() => {
    return formatDuration(_quoteData?.estimateTime);
  }, [bridgeStore.quoteDataMap, bridgeStore.quoteDataService]);

  return (
    <>
      <div
        className="w-full flex justify-between items-center p-[10px] cursor-pointer"
        onClick={() => {
          bridgeStore.set({ showFee: !bridgeStore.showFee });
        }}
      >
        <div className="text-[12px] text-[#70788A] shrink-0">Result</div>
        <div className="flex items-center justify-end flex-1">
          <div className="flex items-center justify-center w-[69px] h-[20px] rounded-[6px] bg-[#EDF0F7] mr-[14px]">
            <img src={ServiceLogoMap[bridgeStore.quoteDataService]} className="w-[62px] h-[16px]" />
          </div>
          <div className="px-[14px] items-center flex gap-[6px] border-l border-[#EBF0F8]">
            <img
              src="/icon-time.svg"
              alt=""
              className="w-[14px] h-[14px] object-center object-contain shrink-0"
            />
            <div className="text-[12px] text-[#444C59]">~{duration}</div>
          </div>
          <div className="px-[14px] items-center flex gap-[6px] border-l border-[#EBF0F8]">
            <div className="text-[12px] text-[#444C59]">Fee:</div>
            <div className="text-[12px] text-[#4DCF5E]">
              {_quoteData?.totalFeesUsd
                ? `~${formatNumber(
                  _quoteData.totalFeesUsd,
                  2,
                  true,
                  { prefix: "$", isZeroPrecision: true }
                )}`
                : "-"}
            </div>
          </div>
        </div>
        <motion.img
          src="/icon-arrow-down.svg"
          className="w-[10px] h-[10px] shrink-0 object-center object-contain"
          alt=""
          animate={{
            rotate: bridgeStore.showFee ? 180 : 0,
          }}
        />
      </div>
      <Suspense fallback={null}>
        {
          bridgeStore.quoteDataService === Service.OneClick && (
            <ResultOneClick />
          )
        }
        {
          bridgeStore.quoteDataService === Service.Usdt0 && (
            <ResultUsdt0 />
          )
        }
      </Suspense>
    </>
  );
}
