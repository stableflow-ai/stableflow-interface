import InputRadio from "@/components/input-radio";
import { stablecoinLogoMap } from "@/config/tokens";
import { Service, ServiceLogoMap, type ServiceType } from "@/services";
import useBridgeStore from "@/stores/use-bridge";
import useWalletStore from "@/stores/use-wallet";
import { formatNumber } from "@/utils/format/number";
import { formatDuration } from "@/utils/format/time";
import Big from "big.js";
import clsx from "clsx";
import { motion } from "framer-motion";

const QuoteRoute = (props: any) => {
  const { service, data, selected, onSelect } = props;

  const walletStore = useWalletStore();
  const bridgeStore = useBridgeStore();

  return (
    <motion.div
      className={clsx(
        "button w-full h-[34px] shrink-0 rounded-[8px] bg-[#EDF0F7] border border-[#EDF0F7] flex justify-between items-center gap-[10px] pl-[6px] pr-[10px]",
        selected ? "" : "",
      )}
      onClick={onSelect}
      animate={{
        backgroundImage: selected ? "linear-gradient(90deg, rgba(1, 237, 151, 0.20) 0%, rgba(1, 237, 151, 0.00) 50%)" : "none",
      }}
    >
      <div className="flex items-center justify-start gap-[5px]">
        <InputRadio
          checked={selected}
          onChange={onSelect}
        />
        <img
          src={ServiceLogoMap[service as ServiceType]}
          alt=""
          className="w-[62px] h-[16px] object-center object-contain shrink-0"
        />
      </div>
      <div className="flex items-center justify-end gap-[10px] text-[12px] font-[400] text-[#444C59] leading-[100%]">
        <div className="w-[1px] h-[14px] bg-[#B3BBCE] shrink-0"></div>
        <div className="flex items-center gap-[4px] border-r border-[#EBF0F8]">
          <img
            src="/icon-gas.svg"
            alt=""
            className="w-[14px] h-[14px] object-center object-contain shrink-0"
          />
          <div className="">
            {
              service === Service.OneClick ? (
                bridgeStore.acceptTronEnergy ?
                  formatNumber(data.energySourceGasFeeUsd, 2, true, { prefix: "$", isZeroPrecision: true, round: Big.roundDown }) :
                  formatNumber(data.transferSourceGasFeeUsd, 2, true, { prefix: "$", isZeroPrecision: true, round: Big.roundDown })
              ) :
                formatNumber(data.estimateSourceGasUsd, 2, true, { prefix: "$", isZeroPrecision: true, round: Big.roundDown })
            }
          </div>
        </div>
        <div className="w-[1px] h-[14px] bg-[#B3BBCE] shrink-0"></div>
        <div className="flex items-center gap-[4px] border-r border-[#EBF0F8]">
          <img
            src="/icon-time.svg"
            alt=""
            className="w-[14px] h-[14px] object-center object-contain shrink-0"
          />
          <div className="">
            ~{formatDuration(data.estimateTime)}
          </div>
        </div>
        <div className="w-[1px] h-[14px] bg-[#B3BBCE] shrink-0"></div>
        <div className="flex items-center gap-[4px]">
          <img
            src={stablecoinLogoMap[walletStore.selectedToken]}
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
