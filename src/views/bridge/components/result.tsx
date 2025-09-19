import useBridgeStore from "@/stores/use-bridge";
import useWalletStore from "@/stores/use-wallet";
import nearIntentsLogo from "@/assets/near-intents-logo.png";
import { formatNumber } from "@/utils/format/number";
import { AnimatePresence, motion } from "framer-motion";
import Big from "big.js";
import { useEffect, useState } from "react";
import { BridgeFee } from "@/services/oneclick";
import Loading from "@/components/loading/icon";
import { useDebounceFn } from "ahooks";
import { useConfigStore } from "@/stores/use-config";

export default function Result() {
  const bridgeStore = useBridgeStore();
  const walletStore = useWalletStore();
  const configStore = useConfigStore();

  const [fees, setFees] = useState<any>();

  const { run: calculateFees } = useDebounceFn(() => {
    const slippage = Big(configStore.slippage).toFixed(2) + "%";

    if (
      !bridgeStore.amount
      || !bridgeStore.quoteData?.quote?.amountOutFormatted
      || Big(bridgeStore.amount).lte(0)
      || Big(bridgeStore.quoteData?.quote?.amountOutFormatted).lte(0)
      || bridgeStore.quoting
    ) {
      setFees({
        netFee: 0,
        bridgeFee: 0,
        gasFee: 0,
        slippage,
      });
      return;
    }
    const netFee = Big(bridgeStore.amount).minus(bridgeStore.quoteData?.quote?.amountOutFormatted);
    const bridgeFee = BridgeFee.reduce((acc, item) => {
      return acc.plus(Big(bridgeStore.amount).times(Big(item.fee).div(10000)));
    }, Big(0));

    const gasFee = Big(netFee).minus(bridgeFee);
    setFees({
      netFee: netFee,
      bridgeFee: bridgeFee,
      gasFee,
      slippage,
    });
  }, { wait: 500 });

  useEffect(() => {
    calculateFees();
  }, [bridgeStore, configStore.slippage]);

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
          <div className="flex items-center gap-[3px] pr-[10px]">
            <span className="text-[12px] text-[#0E3616]/50">Powered by</span>
            <img src={nearIntentsLogo} className="w-[53px] h-[14px]" />
          </div>
          <div className="px-[14px] items-center flex gap-[6px] border-l border-[#B3BBCE]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <path
                opacity="0.5"
                d="M7 0C3.1348 0 0 3.1348 0 7C0 10.8652 3.13323 14 7 14C10.8668 14 14 10.8668 14 7C14 3.1348 10.8668 0 7 0ZM8.83542 7.71003H6.88244C6.4906 7.71003 6.17241 7.39185 6.17241 7V3.28997C6.17241 2.89812 6.4906 2.57994 6.88244 2.57994C7.27429 2.57994 7.59248 2.89812 7.59248 3.28997V6.29154H8.83542C9.22727 6.29154 9.54545 6.60972 9.54545 7.00157C9.54545 7.39342 9.22727 7.71003 8.83542 7.71003Z"
                fill="#B3BBCE"
              />
            </svg>
            <div className="text-[12px] text-[#444C59]">~{bridgeStore.quoteData?.quote?.timeEstimate || "-"}s</div>
          </div>
          <div className="px-[14px] items-center flex gap-[6px] border-l border-[#B3BBCE]">
            {walletStore.fromToken?.icon && (
              <img
                className="w-[14px] h-[14px]"
                src={walletStore.fromToken?.icon}
              />
            )}
            <div className="text-[12px] text-[#444C59]">
              ~
              {bridgeStore.quoteData?.quote?.amountOutFormatted
                ? formatNumber(
                  bridgeStore.quoteData?.quote?.amountOutFormatted,
                  2,
                  true
                )
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
      <AnimatePresence>
        {
          bridgeStore.showFee && (
            <motion.div
              className="w-full flex flex-col items-stretch gap-[8px] px-[10px] overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <FeeItem label="Net fee" loading={bridgeStore.quoting}>
                {fees?.netFee}
              </FeeItem>
              <FeeItem label="Bridge fee" precision={6} loading={bridgeStore.quoting}>
                {fees?.bridgeFee}
              </FeeItem>
              <FeeItem label="Gas fee" precision={6} loading={bridgeStore.quoting}>
                {fees?.gasFee}
              </FeeItem>
              <FeeItem label="Swap Slippage" precision={2} loading={bridgeStore.quoting} isFormat={false}>
                {fees?.slippage}
              </FeeItem>
            </motion.div>
          )
        }
      </AnimatePresence>
    </>
  );
}

const FeeItem = (props: any) => {
  const { label, children, precision = 2, loading, isFormat = true } = props;

  return (
    <div className="w-full flex items-center justify-between gap-[10px] text-[#70788A] text-[12px] font-[400] leading-[120%]">
      <div className="">{label}</div>
      <div className="text-black">
        {
          loading ? (
            <Loading size={10} />
          ) : (
            (isFormat
              ? (
                Big(children || 0).lte(0)
                  ? "-"
                  : formatNumber(children, precision, true, { prefix: "$", isZeroPrecision: true })
              )
              : children
            )
          )
        }
      </div>
    </div>
  );
};
