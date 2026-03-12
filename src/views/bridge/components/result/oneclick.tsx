import useBridgeStore from "@/stores/use-bridge";
import { useConfigStore } from "@/stores/use-config";
import { useDebounceFn } from "ahooks";
import Big from "big.js";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import ResultFeeItem from "./fee-item";
import { Service } from "@/services/constants";
import { formatNumber } from "@/utils/format/number";
import { BridgeFee } from "@/services/oneclick";

const ResultOneClick = (props: any) => {
  const { } = props;

  const bridgeStore = useBridgeStore();
  const configStore = useConfigStore();
  const _quoteData = bridgeStore.quoteDataMap.get(Service.OneClick);

  const [fees, setFees] = useState<any>();

  const { run: calculateFees } = useDebounceFn(() => {
    const slippage = Big(configStore.slippage).toFixed(2) + "%";
    const totalBridgeFee = BridgeFee.reduce?.((acc: any, item: any) => {
      return acc.plus(Big(item.fee).div(100));
    }, Big(0)) ?? 0;
    const totalBridgeFeeLabel = totalBridgeFee.toFixed(2) + "%";
    const totalBridgeFeeValue = Big(bridgeStore.amount || 0).times(Big(totalBridgeFee).div(100));
    const isDelBridgeFee = !_quoteData?.quoteParam?.appFees;

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
        isDelBridgeFee: false,
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
      isDelBridgeFee,
    });
  }, { wait: 500 });

  useEffect(() => {
    calculateFees();
  }, [bridgeStore, configStore.slippage, _quoteData]);

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
            className="w-full flex flex-col items-stretch gap-[8px] px-[10px] overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
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
                  Bridge fee(<span className={fees?.isDelBridgeFee ? "line-through [text-decoration-color:#F00]" : ""}>{fees?.bridgeFee}</span>)
                </>
              )}
              precision={2}
              loading={bridgeStore.getQuoting(Service.OneClick)}
              isDelete={fees?.isDelBridgeFee}
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
