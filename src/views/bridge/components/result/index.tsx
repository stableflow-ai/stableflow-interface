import useBridgeStore from "@/stores/use-bridge";
import { motion } from "framer-motion";
import { lazy, Suspense, useMemo } from "react";
import { Service } from "@/services/constants";
import { PRICE_IMPACT_THRESHOLD } from "@/config";
import { formatDuration } from "@/utils/format/time";
import { formatNumber } from "@/utils/format/number";
import Big from "big.js";
import Checkbox from "@/components/checkbox";
import clsx from "clsx";

const ResultOneClick = lazy(() => import("./oneclick"));
const ResultUsdt0 = lazy(() => import("./usdt0"));
const ResultCCTP = lazy(() => import("./cctp"));
const ResultUsdt0OneClick = lazy(() => import("./usdt0-oneclick"));

const LargeTransactionTip = "Large transactions can take a bit longer to process — usually no more than 3-5 minutes.";

export default function Result() {
  const bridgeStore = useBridgeStore();

  const quoteData = useMemo(() => {
    return bridgeStore.quoteDataMap.get(bridgeStore.quoteDataService);
  }, [bridgeStore.quoteDataMap, bridgeStore.quoteDataService]);

  const [_duration, priceImpact, isLargePriceImpact] = useMemo(() => {
    return [
      formatDuration(quoteData?.estimateTime),
      formatNumber(Big(quoteData?.priceImpact || 0).times(100), 2, true, { prefix: "-" }),
      Big(quoteData?.priceImpact || 0).gt(PRICE_IMPACT_THRESHOLD) && bridgeStore.quoteDataService !== Service.OneClickUsdt0
    ];
  }, [quoteData]);

  const quoteDataList = useMemo(() => {
    bridgeStore.quoteDataMap.forEach((data, service) => {
      data.service = service;
    });
    const list = Array.from(bridgeStore.quoteDataMap.values()).filter((data) => !data.errMsg);
    return list;
  }, [bridgeStore.quoteDataMap]);

  const isOneClickService = useMemo(() => {
    return ([Service.OneClick, Service.OneClickUsdt0] as Service[]).includes(bridgeStore.quoteDataService);
  }, [
    bridgeStore.quoteDataService
  ]);

  const isFromTron = useMemo(() => {
    return quoteData?.quoteParam?.fromToken?.chainType === "tron" && isOneClickService;
  }, [quoteData, isOneClickService]);

  const savedTRX = useMemo(() => {
    if (!isFromTron) {
      return "0";
    }
    const energySourceGasFee = Big(quoteData?.transferSourceGasFee || 0).div(10 ** 6);
    return Big(energySourceGasFee).minus(quoteData?.quoteParam?.needsEnergyAmount || 0).toFixed(0);
  }, [isFromTron, quoteData]);

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
        {
          ([Service.Usdt0OneClick, Service.OneClickUsdt0] as Service[]).includes(bridgeStore.quoteDataService) && (
            <ResultUsdt0OneClick service={bridgeStore.quoteDataService} />
          )
        }
      </Suspense>
      <div className="w-full space-y-1 mt-2">
        {
          isOneClickService && Big(bridgeStore.amount || 0).gte(100000) && (
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
        {
          isLargePriceImpact && (
            <div className="w-full flex justify-between items-center px-[10px] text-[12px] text-[#FF6A19]">
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
        {
          isFromTron && (
            <motion.div
              key="energy"
              className={clsx("w-full px-[10px] text-[#70788A] text-[12px] font-[400] leading-[120%]", bridgeStore.showFee && "mt-[8px]")}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <Checkbox
                checked={bridgeStore.acceptTronEnergy}
                checkedColor="#6284F5"
                onChange={(checked) => {
                  bridgeStore.setAcceptTronEnergy(checked);
                }}
              >
                Gas optimized: ~{savedTRX} TRX saved via energy rental sponsorship.
              </Checkbox>
            </motion.div>
          )
        }
        {
          quoteData?.quoteParam?.needsBandwidth && (
            <motion.div
              key="bandwidth"
              className={clsx("w-full px-[10px] text-[#70788A] text-[12px] font-[400] leading-[120%]", bridgeStore.showFee && "mt-[8px]")}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <img
                src="/icon-gas.svg"
                alt=""
                className="inline-block -translate-y-0.5 w-[14px] h-[14px] object-center object-contain shrink-0"
              />
              <span className="pl-1">
                Small TRX charges for bandwidth may still apply. Please keep at least <strong className="text-[#6284F5]">{quoteData?.quoteParam?.needsBandwidthTRX} TRX</strong> to ensure success.
              </span>
            </motion.div>
          )
        }
        {
          bridgeStore.quoteDataService === Service.OneClickUsdt0 && quoteData && (
            <div className="w-full px-[10px] text-[12px] text-[#70788A]">
              <img
                src="/icon-info.svg"
                alt=""
                className="w-[14px] h-[14px] object-center object-contain shirnk-0 -translate-y-[1px] mr-0.5 inline-block"
              />
              This route requires a payment of <strong>{formatNumber(quoteData?.quote?.amountInFormatted, 6, true)} {quoteData?.quoteParam?.fromToken?.symbol}</strong>, of which <strong>{formatNumber(quoteData?.quote?.amountOutFormatted, 6, true)} {quoteData?.quoteParam?.fromToken?.symbol}</strong> is the amount you will receive.
            </div>
          )
        }
      </div>
    </>
  );
}
