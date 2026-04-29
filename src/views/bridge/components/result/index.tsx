import useBridgeStore from "@/stores/use-bridge";
import { motion } from "framer-motion";
import { lazy, Suspense, useMemo } from "react";
import { Service, ServiceLogoMap, ServiceLogoSimpleMap } from "@/services/constants";
import { PRICE_IMPACT_THRESHOLD } from "@/config";
import { formatDuration } from "@/utils/format/time";
import { formatNumber } from "@/utils/format/number";
import Big from "big.js";
import Checkbox from "@/components/checkbox";
import clsx from "clsx";
import { getQuoteModes } from "@/services/utils";
import { getStableflowIcon } from "@/utils/format/logo";
import { routeHybridPath } from "../../utils";
import LazyImage from "@/components/lazy-image";
import Popover from "@/components/popover";

const ResultOneClick = lazy(() => import("./oneclick"));
const ResultUsdt0 = lazy(() => import("./usdt0"));
const ResultCCTP = lazy(() => import("./cctp"));
const ResultFraxZero = lazy(() => import("./fraxzero"));
const ResultUsdt0OneClick = lazy(() => import("./usdt0-oneclick"));
const ResultNative = lazy(() => import("./native"));
const ResultFeeItem = lazy(() => import("./fee-item"));

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

  const routePathMap = useMemo(() => {
    return routeHybridPath(quoteData, bridgeStore.quoteDataService);
  }, [quoteData, bridgeStore.quoteDataService]);

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
      <div
        key="fee-detail-common"
        className="w-full flex flex-col items-stretch gap-2 overflow-hidden mt-2"
      >
        <Suspense fallback={null}>
          <ResultFeeItem
            label="Source gas fee"
            loading={bridgeStore.getQuoting(bridgeStore.quoteDataService)}
            isFormat={false}
          >
            {
              (([Service.OneClick, Service.OneClickUsdt0] as Service[]).includes(bridgeStore.quoteDataService) && isFromTron) ? (
                bridgeStore.acceptTronEnergy ?
                  formatNumber(quoteData?.energySourceGasFeeUsd, 2, true, { prefix: "$", isZeroPrecision: true, round: Big.roundDown }) :
                  formatNumber(quoteData?.transferSourceGasFeeUsd, 2, true, { prefix: "$", isZeroPrecision: true, round: Big.roundDown })
              ) :
                formatNumber(quoteData?.estimateSourceGasUsd, 6, true, { prefix: "$", isZeroPrecision: true, round: Big.roundDown })
            }
          </ResultFeeItem>
          <ResultFeeItem
            label="Time"
            precision={2}
            loading={bridgeStore.getQuoting(bridgeStore.quoteDataService)}
            isFormat={false}
          >
            ~{formatDuration(quoteData?.estimateTime, { compound: true })}
          </ResultFeeItem>
          {
            routePathMap && routePathMap.length > 1 && (
              <ResultFeeItem
                label="Route"
                className="items-start"
                labelClassName="pt-0"
                loading={false}
                isDelete={false}
                isFormat={false}
              >
                <Popover
                  placement="Top"
                  trigger="Hover"
                  offset={10}
                  closeDelayDuration={0}
                  content={(
                    <div className="border border-[#F2F2F2] bg-white rounded-lg shadow-[0_0_10px_0_rgba(0,0,0,0.10)] p-2.5">
                      <div className="text-[#444C59] text-xs leading-[100%] font-normal">
                        Route
                      </div>
                      <div className="space-y-2 mt-4">
                        {
                          routePathMap.map((item: any, index: number) => (
                            <RoutePath
                              key={index}
                              fromToken={item.fromToken}
                              toToken={item.toToken}
                              service={item.service}
                            />
                          ))
                        }
                      </div>
                    </div>
                  )}
                >
                  <div className="group flex items-center gap-1.5 h-7.5 border border-[#F2F2F2] cursor-pointer duration-150 bg-white rounded-lg pl-1 pr-2 grow-0">
                    {
                      routePathMap?.map((route, idx) => (
                        <>
                          <LazyImage
                            key={`simplePathImg${idx}`}
                            src={ServiceLogoSimpleMap[route.service]}
                            containerClassName="size-4 shrink-0"
                          />
                          {
                            idx < routePathMap.length - 1 && (
                              <svg width="7" height="8" viewBox="0 0 7 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 2.73358C6.66667 3.11848 6.66667 4.08073 6 4.46563L1.5 7.06371C0.833334 7.44861 -3.65772e-07 6.96749 -3.32122e-07 6.19769L-1.04991e-07 1.00153C-7.13424e-08 0.231733 0.833333 -0.249393 1.5 0.135507L6 2.73358Z" fill="#9FA7BA" />
                              </svg>
                            )
                          }
                        </>
                      ))
                    }
                    <LazyImage
                      src={getStableflowIcon("icon-arrow-down.svg")}
                      containerClassName="w-4 h-1.5 -rotate-90 group-hover:rotate-[-180deg] duration-150"
                    />
                  </div>
                </Popover>
              </ResultFeeItem>
            )
          }
        </Suspense>
      </div>
      <div className="w-full space-y-1 mt-2">
        {
          isOneClickService && Big(bridgeStore.amount || 0).gte(100000) && (
            <motion.div
              key="duration"
              className={clsx("w-full text-[#70788A] text-xs font-normal leading-[120%]", bridgeStore.showFee && "mt-2")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
              The approved amount cannot be less than <strong>{formatNumber(quoteData?.quote?.amountInFormatted, 6, true)} {quoteData?.quoteParam?.fromToken?.symbol}</strong>.
              {/* This route requires a payment of <strong>{formatNumber(quoteData?.quote?.amountInFormatted, 6, true)} {quoteData?.quoteParam?.fromToken?.symbol}</strong>, of which <strong>{formatNumber(quoteData?.quote?.amountOutFormatted, 6, true)} {quoteData?.quoteParam?.toToken?.symbol}</strong> is the amount you will receive. */}
            </div>
          )
        }
      </div>
    </div>
  );
}

const RoutePath = (props: any) => {
  const { fromToken, toToken, service } = props;

  return (
    <div className="flex items-center gap-1 min-w-[280px] text-[#70788A] text-xs leading-[100%] font-normal">
      <div className="shrink-0 flex items-center gap-1">
        <div className="">{fromToken?.chainName}</div>
        <img
          src={fromToken?.icon}
          alt=""
          className="shrink-0 w-4 h-4 object-center object-contain rounded-full"
        />
      </div>
      <div className="relative flex items-center flex-1 w-0 gap-1">
        <div className="flex-1 border-t border-dashed border-[#D6D6D6]"></div>
        <img
          src={ServiceLogoMap[service as Service]}
          alt=""
          className="shrink-0 w-14 h-4 object-center object-contain"
        />
        <div className="flex-1 border-t border-dashed border-[#D6D6D6]"></div>
      </div>
      <div className="shrink-0 flex items-center gap-1">
        <div className="">{toToken?.chainName}</div>
        <img
          src={toToken?.icon}
          alt=""
          className="shrink-0 w-4 h-4 object-center object-contain rounded-full"
        />
      </div>
    </div>
  );
};
