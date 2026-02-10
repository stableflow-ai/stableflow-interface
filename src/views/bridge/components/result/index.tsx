import useBridgeStore from "@/stores/use-bridge";
import { motion } from "framer-motion";
import { lazy, Suspense, useMemo } from "react";
import { Service } from "@/services/constants";
import Checkbox from "@/components/checkbox";
import { formatDuration } from "@/utils/format/time";
import Big from "big.js";
import { formatNumber } from "@/utils/format/number";
import { PRICE_IMPACT_THRESHOLD } from "@/config";

const ResultOneClick = lazy(() => import("./oneclick"));
const ResultUsdt0 = lazy(() => import("./usdt0"));
const ResultCCTP = lazy(() => import("./cctp"));

export default function Result() {
  const bridgeStore = useBridgeStore();

  const quoteData = useMemo(() => {
    return bridgeStore.quoteDataMap.get(bridgeStore.quoteDataService);
  }, [bridgeStore.quoteDataMap, bridgeStore.quoteDataService]);

  const [_duration, priceImpact, isLargePriceImpact] = useMemo(() => {
    return [
      formatDuration(quoteData?.estimateTime),
      formatNumber(Big(quoteData?.priceImpact || 0).times(100), 2, true, { prefix: "-" }),
      Big(quoteData?.priceImpact || 0).gt(PRICE_IMPACT_THRESHOLD)
    ];
  }, [quoteData]);

  const quoteDataList = useMemo(() => {
    bridgeStore.quoteDataMap.forEach((data, service) => {
      data.service = service;
    });
    const list = Array.from(bridgeStore.quoteDataMap.values()).filter((data) => !data.errMsg);
    return list;
  }, [bridgeStore.quoteDataMap]);

  return (
    <>
      <div className="w-full flex justify-between items-center p-[10px] cursor-pointer">
        <div
          className="flex items-center gap-[6px] shrink-0"
          onClick={() => {
            bridgeStore.set({ showFee: !bridgeStore.showFee });
          }}
        >
          <div className="text-[12px] text-[#70788A] leading-[100%] font-[400]">
            View Details
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
        <div
          className="flex justify-end items-center gap-[6px] shrink-0"
          onClick={() => {
            bridgeStore.set({ showRoutes: !bridgeStore.showRoutes });
          }}
        >
          <div className="text-[12px] text-[#70788A] leading-[100%] font-[400]">
            View All Routes <span className="">{quoteDataList?.length}</span>
          </div>
          <motion.img
            src="/icon-arrow-down.svg"
            className="w-[10px] h-[10px] shrink-0 object-center object-contain"
            alt=""
            animate={{
              rotate: bridgeStore.showRoutes ? -180 : -90,
            }}
          />
        </div>
        {/* <div className="flex items-center justify-end flex-1">
          <div className="flex items-center justify-center w-[69px] h-[20px] rounded-[6px] bg-[#EDF0F7] mr-[14px]">
            <img src={ServiceLogoMap[bridgeStore.quoteDataService || Service.OneClick]} className="w-[62px] h-[16px]" />
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
        </div> */}
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
        {
          bridgeStore.quoteDataService === Service.CCTP && (
            <ResultCCTP />
          )
        }
      </Suspense>
      {
        isLargePriceImpact && (
          <div className="w-full flex justify-between items-center p-[10px] text-[12px] text-[#FF6A19]">
            <div className="flex items-center gap-[10px]">
              <Checkbox
                checked={bridgeStore.acceptPriceImpact}
                checkedColor="#FF6A19"
                onChange={(checked) => {
                  bridgeStore.setAcceptPriceImpact(checked);
                }}
              >
                I accept the price impact
              </Checkbox>
            </div>
            <div className="">
              {priceImpact}%
            </div>
          </div>
        )
      }
    </>
  );
}
