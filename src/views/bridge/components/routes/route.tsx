import InputRadio from "@/components/input-radio";
import { stablecoinLogoMap } from "@/config/tokens";
import useIsMobile from "@/hooks/use-is-mobile";
import { ServiceLogoMap, ServiceLogoSimpleMap } from "@/services/constants";
import { Service } from "@/services/constants";
import useBridgeStore from "@/stores/use-bridge";
import useWalletStore from "@/stores/use-wallet";
import { getStableflowIcon } from "@/utils/format/logo";
import { formatNumber } from "@/utils/format/number";
import { formatDuration } from "@/utils/format/time";
import Big from "big.js";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useMemo } from "react";

const QuoteRoute = (props: any) => {
  const { service, data, selected, onSelect, isBest } = props;

  const isMobile = useIsMobile();
  const walletStore = useWalletStore();
  const bridgeStore = useBridgeStore();

  const isFromTron = data?.quoteParam?.fromToken?.chainType === "tron";

  const [displayServiceLogo, displayService] = useMemo(() => {
    let _service = service as Service;
    const serviceLogos = isMobile ? ServiceLogoSimpleMap : ServiceLogoMap;
    let _serviceLogo = serviceLogos[service as Service];
    if (service === Service.FraxZeroOneClick) {
      if (data?.quoteParam?.isToEthereumUSDC) {
        _service = Service.FraxZero;
        _serviceLogo = serviceLogos[Service.FraxZero];
      }
    }
    if (service === Service.OneClickFraxZero) {
      if (data?.quoteParam?.isFromEthereumUSDC) {
        _service = Service.FraxZero;
        _serviceLogo = serviceLogos[Service.FraxZero];
      }
    }
    return [_serviceLogo, _service];
  }, [data, service, isMobile]);

  return (
    <motion.div
      className={clsx(
        "button w-full h-8.5 shrink-0 rounded-[8px] bg-[#FFFFFF] border border-[#F2F2F2] flex justify-between items-center gap-1 md:gap-2.5 pl-2 md:pl-3 pr-2 md:pr-3",
        selected ? "" : "",
      )}
      onClick={onSelect}
      animate={{
        backgroundImage: selected ? "linear-gradient(0deg, rgba(98, 132, 245, 0.10) 0%, rgba(98, 132, 245, 0.10) 100%)" : "none",
        borderColor: selected ? "#6284F5" : "#F2F2F2",
      }}
    >
      <div className="flex items-center justify-start gap-[5px]">
        {/* <InputRadio
          checked={selected}
          onChange={onSelect}
        /> */}
        <img
          src={displayServiceLogo}
          alt=""
          className={clsx(
            "object-left object-contain shrink-0",
            ([Service.OneClickUsdt0, Service.Usdt0OneClick, Service.FraxZeroOneClick, Service.OneClickFraxZero] as Service[]).includes(displayService)
              ? isMobile ? "w-7.5 h-4" : "w-29.5 h-6"
              : isMobile ? "size-4" : "w-15.5 h-4",
          )}
        />
        {
          isBest && (
            <div className="w-9 h-4.5 rounded-xl bg-[#DAF1CD] text-[#6CB53F] flex justify-center items-center text-[10px] font-medium leading-[100%]">
              Best
            </div>
          )
        }
      </div>
      <div className="flex items-center justify-end gap-1.5 md:gap-2.5 text-xs font-normal text-[#444C59] leading-[100%]">
        <div className="flex items-center gap-[4px]">
          <img
            src={getStableflowIcon("icon-fee.svg")}
            alt=""
            className="w-[14px] h-[14px] object-center object-contain shrink-0"
          />
          <div className="">
            {
              ([Service.OneClick, Service.OneClickUsdt0].includes(service) && isFromTron) ? (
                bridgeStore.acceptTronEnergy ?
                  formatNumber(Big(data.energySourceGasFeeUsd || 0).plus(data.totalFeesUsd || 0), 6, true, { prefix: "$", isZeroPrecision: true, round: Big.roundDown }) :
                  formatNumber(Big(data.transferSourceGasFeeUsd || 0).plus(data.totalFeesUsd || 0), 6, true, { prefix: "$", isZeroPrecision: true, round: Big.roundDown })
              ) :
                formatNumber(Big(data.estimateSourceGasUsd || 0).plus(data.totalFeesUsd || 0), 6, true, { prefix: "$", isZeroPrecision: true, round: Big.roundDown })
            }
          </div>
        </div>
        <div className="w-[1px] h-[14px] bg-[#B3BBCE] shrink-0"></div>
        <div className="flex items-center gap-[4px]">
          <img
            src={getStableflowIcon("icon-time.svg")}
            alt=""
            className="w-[14px] h-[14px] object-center object-contain shrink-0"
          />
          <div
            className={clsx(
              data.estimateTime > 300 && "text-[#E53935]",
              data.estimateTime > 60 && data.estimateTime <= 300 && "text-[#F9A825]",
            )}
          >
            ~{formatDuration(data.estimateTime, { compound: true })}
          </div>
        </div>
        <div className="w-[1px] h-[14px] bg-[#B3BBCE] shrink-0"></div>
        <div className="flex items-center gap-[4px]">
          <img
            src={data?.quoteParam?.toToken?.icon}
            alt=""
            className="w-[14px] h-[14px] object-center object-contain shrink-0"
          />
          <div className="">
            {formatNumber(data.outputAmount, 2, true, { prefix: "~", isShort: true, isShortUppercase: true, round: Big.roundDown })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuoteRoute;
