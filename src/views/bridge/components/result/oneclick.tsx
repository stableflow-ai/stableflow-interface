import useBridgeStore from "@/stores/use-bridge";
import { useConfigStore } from "@/stores/use-config";
import { useDebounceFn } from "ahooks";
import Big from "big.js";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import ResultFeeItem from "./fee-item";
import { Service } from "@/services/constants";
import { BridgeFee, checkIsBridgeFee } from "@/services/oneclick";
import { formatNumber } from "@/utils/format/number";

const ResultOneClick = (props: any) => {
  const { } = props;

  const bridgeStore = useBridgeStore();
  const configStore = useConfigStore();
  const _quoteData = bridgeStore.quoteDataMap.get(Service.OneClick);

  const [fees, setFees] = useState<any>();

  const { run: calculateFees } = useDebounceFn(() => {
    const slippage = Big(configStore.slippage).toFixed(2) + "%";
    const isBridgeFee = checkIsBridgeFee(_quoteData?.quoteParam);
    const totalBridgeFee = BridgeFee.reduce((acc, item) => {
      return acc.plus(Big(item.fee).div(100));
    }, Big(0));
    const totalBridgeFeeLabel = totalBridgeFee.toFixed(2) + "%";
    const totalBridgeFeeValue = Big(bridgeStore.amount || 0).times(Big(totalBridgeFee).div(100));

    if (
      !bridgeStore.amount
      || !_quoteData?.quote?.amountOutFormatted
      || Big(bridgeStore.amount).lte(0)
      || Big(_quoteData?.quote?.amountOutFormatted).lte(0)
    ) {
      setFees({
        totalFee: 0,
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

  const isExchangeToken = useMemo(() => {
    const fromTokenSymbol = _quoteData?.quoteParam?.fromToken?.symbol === "USD₮0" ? "USDT" : _quoteData?.quoteParam?.fromToken?.symbol;
    const toTokenSymbol = _quoteData?.quoteParam?.toToken?.symbol === "USD₮0" ? "USDT" : _quoteData?.quoteParam?.toToken?.symbol;
    return fromTokenSymbol && toTokenSymbol && fromTokenSymbol !== toTokenSymbol;
  }, [_quoteData]);

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
              isExchangeToken ? (
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
                  loading={bridgeStore.getQuoting(Service.OneClick)}
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
              loading={bridgeStore.getQuoting(Service.OneClick)}
              isDelete={!fees?.isBridgeFee}
            >
              {fees?.bridgeFeeValue}
            </ResultFeeItem>
            {/* <ResultFeeItem 
            label="Swap Slippage"
             precision={2} 
             loading={bridgeStore.getQuoting(Service.OneClick)} 
             isFormat={false}
             >
            {fees?.slippage}
          </ResultFeeItem> */}
          </motion.div>
        )
      }
    </AnimatePresence>
  );
};

export default ResultOneClick;
