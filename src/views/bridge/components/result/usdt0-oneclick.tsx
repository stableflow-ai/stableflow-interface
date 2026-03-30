import useBridgeStore from "@/stores/use-bridge";
import { useConfigStore } from "@/stores/use-config";
import { useDebounceFn } from "ahooks";
import Big from "big.js";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import ResultFeeItem from "./fee-item";
import { Service } from "@/services/constants";
import { formatNumber } from "@/utils/format/number";
import { BridgeFee, checkIsBridgeFee } from "@/services/oneclick";
import { ServiceLogoMap } from "@/services";

const ResultUsdt0OneClick = (props: any) => {
  const { service } = props;

  const bridgeStore = useBridgeStore();
  const configStore = useConfigStore();
  const _quoteData = bridgeStore.quoteDataMap.get(service);

  const [fees, setFees] = useState<any>();

  const { run: calculateFees } = useDebounceFn(() => {
    const slippage = Big(configStore.slippage).toFixed(2) + "%";
    let oneclickFromToken;
    let oneclickToToken;
    if (service === Service.Usdt0OneClick) {
      oneclickFromToken = _quoteData?.quoteParam?.middleToken;
      oneclickToToken = _quoteData?.quoteParam?.toToken;
    }
    if (service === Service.OneClickUsdt0) {
      oneclickFromToken = _quoteData?.quoteParam?.fromToken;
      oneclickToToken = _quoteData?.quoteParam?.middleToken;
    }
    if (service === Service.FraxZeroOneClick) {
      oneclickFromToken = _quoteData?.quoteParam?.middleToken;
      oneclickToToken = _quoteData?.quoteParam?.toToken;
    }
    if (service === Service.OneClickFraxZero) {
      oneclickFromToken = _quoteData?.quoteParam?.fromToken;
      oneclickToToken = _quoteData?.quoteParam?.middleToken;
    }
    const isBridgeFee = checkIsBridgeFee({
      fromToken: oneclickFromToken,
      toToken: oneclickToToken,
    });
    const totalBridgeFee = BridgeFee.reduce((acc, item) => {
      return acc.plus(Big(item.fee).div(100));
    }, Big(0));
    const totalBridgeFeeLabel = totalBridgeFee.toFixed(2) + "%";
    const totalBridgeFeeValue = Big(bridgeStore.amount || 0).times(Big(totalBridgeFee).div(100));

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
        bridgeFee: totalBridgeFeeLabel,
        bridgeFeeValue: 0,
        netFee: 0,
        exchangeRate: 1,
        slippage,
        isBridgeFee,
      });
      return;
    }

    setFees({
      totalFee: _quoteData?.totalFeesUsd,
      messagingFee: _quoteData?.fees?.nativeFeeUsd,
      messagingFeeAmount: _quoteData?.fees?.nativeFee,
      messagingFeeUnit: [Service.OneClickUsdt0, Service.OneClickFraxZero].includes(service) ? _quoteData?.quoteParam?.middleToken?.nativeToken?.symbol : _quoteData?.quoteParam?.fromToken?.nativeToken?.symbol,
      legacyMeshFee: _quoteData?.fees?.legacyMeshFeeUsd,
      estimatedSourceGas: _quoteData?.fees?.estimateGasUsd,
      bridgeFee: totalBridgeFeeLabel,
      bridgeFeeValue: totalBridgeFeeValue,
      netFee: _quoteData?.fees?.destinationGasFeeUsd,
      exchangeRate: formatNumber(_quoteData?.exchangeRate, 6, true, { round: Big.roundDown }),
      slippage,
      isBridgeFee,
    });
  }, { wait: 500 });

  useEffect(() => {
    calculateFees();
  }, [bridgeStore, configStore.slippage]);

  const [isOneClickExchangeToken, isOneClickBridge, isLayerzeroBridge] = useMemo(() => {
    let _fromToken = _quoteData?.quoteParam?.fromToken;
    let _toToken = _quoteData?.quoteParam?.toToken;
    let _isOneClickBridge = true;
    let _isLayerzeroBridge = true;
    if ([Service.OneClickUsdt0, Service.OneClickFraxZero].includes(service)) {
      _toToken = _quoteData?.quoteParam?.middleToken;
    }
    if ([Service.Usdt0OneClick, Service.FraxZeroOneClick].includes(service)) {
      _fromToken = _quoteData?.quoteParam?.middleToken;
    }
    const fromTokenSymbol = _fromToken?.symbol === "USD₮0" ? "USDT" : _fromToken?.symbol;
    const toTokenSymbol = _toToken?.symbol === "USD₮0" ? "USDT" : _toToken?.symbol;
    if (Service.FraxZeroOneClick === service) {
      if (_quoteData?.quoteParam?.isToEthereumUSDC) {
        _isOneClickBridge = false;
      }
      if (_quoteData?.quoteParam?.isFromEthereumFrxUSD) {
        _isLayerzeroBridge = false;
      }
    }
    if (Service.OneClickFraxZero === service) {
      if (_quoteData?.quoteParam?.isFromEthereumUSDC) {
        _isOneClickBridge = false;
      }
      if (_quoteData?.quoteParam?.isToEthereumFrxUSD) {
        _isLayerzeroBridge = false;
      }
    }
    return [
      fromTokenSymbol && toTokenSymbol && fromTokenSymbol !== toTokenSymbol,
      _isOneClickBridge,
      _isLayerzeroBridge,
    ];
  }, [_quoteData]);

  const routePathMap = useMemo(() => {
    if (!_quoteData) return [];

    const p = _quoteData.quoteParam;

    const buildPath = (
      steps: Array<{ from: any; to: any; svc: Service; skip?: boolean }>
    ) =>
      steps
        .filter((s) => !s.skip)
        .map(({ from, to, svc }) => ({ fromToken: from, toToken: to, service: svc }));

    switch (service) {
      case Service.OneClickUsdt0:
        return buildPath([
          { from: p?.fromToken, to: p?.middleToken, svc: Service.OneClick },
          { from: p?.middleToken, to: p?.toToken, svc: Service.Usdt0 },
        ]);
      case Service.Usdt0OneClick:
        return buildPath([
          { from: p?.fromToken, to: p?.middleToken, svc: Service.Usdt0 },
          { from: p?.middleToken, to: p?.toToken, svc: Service.OneClick },
        ]);
      case Service.OneClickFraxZero:
        return buildPath([
          { from: p?.fromToken, to: p?.middleToken, svc: Service.OneClick, skip: p?.isFromEthereumUSDC },
          { from: p?.middleToken, to: p?.middleToken2, svc: Service.FraxZero },
          { from: p?.middleToken2, to: p?.toToken, svc: Service.FraxZero, skip: p?.isToEthereumFrxUSD },
        ]);
      case Service.FraxZeroOneClick:
        return buildPath([
          { from: p?.fromToken, to: p?.middleToken2, svc: Service.FraxZero, skip: p?.isFromEthereumFrxUSD },
          { from: p?.middleToken2, to: p?.middleToken, svc: Service.FraxZero },
          { from: p?.middleToken, to: p?.toToken, svc: Service.OneClick, skip: p?.isToEthereumUSDC },
        ]);
      default:
        return [];
    }
  }, [_quoteData, service]);

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
              isLayerzeroBridge && (
                <>
                  {
                    !!fees?.legacyMeshFee && Big(fees?.legacyMeshFee).gt(0) && (
                      <ResultFeeItem
                        label="Legacy Mesh Fee"
                        loading={bridgeStore.getQuoting(service)}
                      >
                        {fees?.legacyMeshFee}
                      </ResultFeeItem>
                    )
                  }
                  <ResultFeeItem
                    label="Messaging Fee"
                    isFormat={false}
                    loading={bridgeStore.getQuoting(service)}
                  >
                    {formatNumber(fees?.messagingFeeAmount, 6, true)} {fees?.messagingFeeUnit} ({formatNumber(fees?.messagingFee, 2, true, { prefix: "$" })})
                  </ResultFeeItem>
                </>
              )
            }
            {
              isOneClickBridge && (
                <>
                  {
                    isOneClickExchangeToken ? (
                      <ResultFeeItem
                        label="Exchange Rate"
                        loading={bridgeStore.getQuoting(service)}
                        isFormat={false}
                      >
                        1 {_quoteData?.quoteParam.fromToken.symbol} ~ {fees?.exchangeRate} {_quoteData?.quoteParam.toToken.symbol}
                      </ResultFeeItem>
                    ) : (
                      <ResultFeeItem
                        label="Net fee"
                        loading={bridgeStore.getQuoting(service)}
                      >
                        {fees?.netFee}
                      </ResultFeeItem>
                    )
                  }
                  <ResultFeeItem
                    label={(
                      <>
                        Bridge fee(<span className={fees?.isBridgeFee ? "" : "line-through [text-decoration-color:#F00]"}>{fees?.bridgeFee}</span>)
                      </>
                    )}
                    precision={2}
                    loading={bridgeStore.getQuoting(service)}
                    isDelete={!fees?.isBridgeFee}
                  >
                    {fees?.bridgeFeeValue}
                  </ResultFeeItem>
                </>
              )
            }
            {
              routePathMap && routePathMap.length > 1 && (
                <ResultFeeItem
                  label="Routes"
                  className="items-start"
                  labelClassName="pt-0"
                  loading={false}
                  isDelete={false}
                  isFormat={false}
                >
                  <div className="space-y-2">
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
                </ResultFeeItem>
              )
            }
          </motion.div>
        )
      }
    </AnimatePresence>
  );
};

export default ResultUsdt0OneClick;

const RoutePath = (props: any) => {
  const { fromToken, toToken, service } = props;

  return (
    <div className="flex items-center gap-1 min-w-[280px]">
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
