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
import { FRAXZERO_MIDDLE_TOKEN_USDC } from "@/services/fraxzero/config";
import { getQuoteModes } from "@/services/utils";
import { getStableflowIcon } from "@/utils/format/logo";

const ResultOneClick = lazy(() => import("./oneclick"));
const ResultUsdt0 = lazy(() => import("./usdt0"));
const ResultCCTP = lazy(() => import("./cctp"));
const ResultFraxZero = lazy(() => import("./fraxzero"));
const ResultUsdt0OneClick = lazy(() => import("./usdt0-oneclick"));
const ResultNative = lazy(() => import("./native"));

const LargeTransactionTip = "Large transactions can take a bit longer to process — usually no more than 3-5 minutes.";

export default function Result() {
  const bridgeStore = useBridgeStore();

  const quoteData = useMemo(() => {
    return bridgeStore.quoteDataMap.get(bridgeStore.quoteDataService);
  }, [bridgeStore.quoteDataMap, bridgeStore.quoteDataService]);

  const [_duration, priceImpact, isLargePriceImpact, isExactOutput] = useMemo(() => {
    const { isExactOutput: _isOutputMode } = getQuoteModes({
      quoteData,
      bridgeStore,
    });
    return [
      formatDuration(quoteData?.estimateTime),
      formatNumber(Big(quoteData?.priceImpact || 0).times(100), 2, true, { prefix: "-" }),
      Big(quoteData?.priceImpact || 0).gt(PRICE_IMPACT_THRESHOLD) && !_isOutputMode,
      _isOutputMode
    ];
  }, [quoteData, bridgeStore.quoteDataService]);

  const quoteDataList = useMemo(() => {
    bridgeStore.quoteDataMap.forEach((data, service) => {
      data.service = service;
    });
    const list = Array.from(bridgeStore.quoteDataMap.values()).filter((data) => !data.errMsg);
    return list;
  }, [bridgeStore.quoteDataMap]);

  const { isOneClickService } = useMemo(() => {
    return getQuoteModes({
      quoteData,
      bridgeStore,
    });
  }, [
    bridgeStore.quoteDataService,
    quoteData
  ]);

  const isFromTron = useMemo(() => {
    return quoteData?.quoteParam?.fromToken?.chainType === "tron" && isOneClickService;
  }, [quoteData, isOneClickService]);

  const savedTRX = useMemo(() => {
    if (!isFromTron) {
      return "0";
    }
    const energySourceGasFee = Big(quoteData?.transferSourceGasFee?.toString() || 0).div(10 ** 6);
    return Math.max(0, Number(Big(energySourceGasFee).minus(quoteData?.quoteParam?.needsEnergyAmount || 0).toFixed(0)));
  }, [isFromTron, quoteData]);

  return (
    <div className="pt-3 pl-5 pr-5.5">
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
          bridgeStore.quoteDataService === Service.FraxZero && (
            <ResultFraxZero />
          )
        }
        {
          ([Service.Usdt0OneClick, Service.OneClickUsdt0, Service.FraxZeroOneClick, Service.OneClickFraxZero] as Service[]).includes(bridgeStore.quoteDataService) && (
            <ResultUsdt0OneClick service={bridgeStore.quoteDataService} />
          )
        }
        {
          bridgeStore.quoteDataService === Service.Native && (
            <ResultNative />
          )
        }
      </Suspense>
      <div className="w-full space-y-1 mt-2">
        {
          isOneClickService && Big(bridgeStore.amount || 0).gte(100000) && (
            <motion.div
              key="duration"
              className={clsx("w-full text-[#70788A] text-xs font-normal leading-[120%]", bridgeStore.showFee && "mt-2")}
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
            <div className="w-full flex justify-between items-center text-xs font-normal text-[#FF6A19]">
              <div className="flex items-center gap-2.5">
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
              className={clsx("w-full text-[#70788A] text-xs font-normal leading-[120%]", bridgeStore.showFee && "mt-2")}
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
              className={clsx("w-full text-[#70788A] text-xs font-normal leading-[120%]", bridgeStore.showFee && "mt-2")}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <img
                src={getStableflowIcon("icon-gas.svg")}
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
          isExactOutput && quoteData && (
            <div className="w-full text-xs font-normal text-[#70788A]">
              <img
                src={getStableflowIcon("icon-info.svg")}
                alt=""
                className="w-[14px] h-[14px] object-center object-contain shirnk-0 -translate-y-[1px] mr-0.5 inline-block"
              />
              This route requires a payment of <strong>{formatNumber(quoteData?.quote?.amountInFormatted, 6, true)} {quoteData?.quoteParam?.fromToken?.symbol}</strong>, of which <strong>{formatNumber(quoteData?.quote?.amountOutFormatted, 6, true)} {quoteData?.quoteParam?.toToken?.symbol}</strong> is the amount you will receive.
            </div>
          )
        }
      </div>
    </div>
  );
}
