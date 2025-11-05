import { ServiceLogoMap, type ServiceType } from "@/services";
import { formatNumber } from "@/utils/format/number";
import { formatDuration } from "@/utils/format/time";
import clsx from "clsx";

const QuoteRoute = (props: any) => {
  const { service, data, selected, onSelect } = props;

  return (
    <div
      className={clsx(
        "button border rounded-[10px] p-[10px] hover:bg-[#EDF0F7] duration-300",
        selected ? "border-[#6284F5]" : "border-[#EBF0F8]",
      )}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between gap-[10px]">
        <img
          src={ServiceLogoMap[service as ServiceType]}
          alt=""
          className="w-[62px] h-[16px] object-center object-contain shrink-0"
        />
        <div className="text-[#4DCF5E]">
          {formatNumber(data.outputAmount, 2, true, { prefix: "+", isShort: true, isShortUppercase: true })}
        </div>
      </div>
      <div className="mt-[10px] flex items-center justify-end gap-[10px] text-[12px] font-[400] text-[#444C59]">
        <div className="flex items-center gap-[4px] border-r border-[#EBF0F8] pr-[10px]">
          <img
            src="/icon-time.svg"
            alt=""
            className="w-[14px] h-[14px] object-center object-contain shrink-0"
          />
          <div className="">
            ~{formatDuration(data.estimateTime)}
          </div>
        </div>
        <div className="flex items-center gap-[4px]">
          <div className="text-[#B3BBCE]">
            Fee:
          </div>
          <div className="">
            ~{formatNumber(data.totalFeesUsd, 2, true, { prefix: "$", isZeroPrecision: true })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteRoute;
