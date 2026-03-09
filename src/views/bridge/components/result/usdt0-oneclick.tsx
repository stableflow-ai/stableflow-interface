import useBridgeStore from "@/stores/use-bridge";
import { useConfigStore } from "@/stores/use-config";
import { useDebounceFn } from "ahooks";
import Big from "big.js";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import ResultFeeItem from "./fee-item";
import { Service } from "@/services/constants";
import { formatNumber } from "@/utils/format/number";
import { BridgeFee } from "@/services/oneclick";

const ResultUsdt0OneClick = (props: any) => {
  const { service } = props;

  const bridgeStore = useBridgeStore();
  const configStore = useConfigStore();
  const _quoteData = bridgeStore.quoteDataMap.get(service);

  const [fees, setFees] = useState<any>();

  const { run: calculateFees } = useDebounceFn(() => {
    const slippage = Big(configStore.slippage).toFixed(2) + "%";
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
    return [
      fromTokenSymbol && toTokenSymbol && fromTokenSymbol !== toTokenSymbol,
      _isOneClickBridge,
      _isLayerzeroBridge,
    ];
  }, [_quoteData]);

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
                        loading={bridgeStore.getQuoting(Service.OneClick)}
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
                        Bridge fee({fees?.bridgeFee})
                      </>
                    )}
                    precision={2}
                    loading={bridgeStore.getQuoting(service)}
                    isDelete={false}
                  >
                    {fees?.bridgeFeeValue}
                  </ResultFeeItem>
                </>
              )
            }
          </motion.div>
        )
      }
    </AnimatePresence>
  );
};

export default ResultUsdt0OneClick;
