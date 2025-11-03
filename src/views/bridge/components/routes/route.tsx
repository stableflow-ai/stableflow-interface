import { formatNumber } from "@/utils/format/number";

const QuoteRoute = () => {
  return (
    <div className="border border-[#EBF0F8] border-[#6284F5] rounded-[10px] p-[10px] hover:bg-[#EDF0F7] duration-300 cursor-pointer">
      <div className="flex items-center justify-between gap-[10px]">
        <img
          src="/src/assets/near-intents-logo.png"
          alt=""
          className="w-[62px] h-[16px] object-center object-contain shrink-0"
        />
        <div className="text-[#4DCF5E]">
          {formatNumber(100, 2, true, { prefix: "+", isShort: true, isShortUppercase: true })}
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
            ~34s
          </div>
        </div>
        <div className="flex items-center gap-[4px]">
          <div className="text-[#B3BBCE]">
            Fee:
          </div>
          <div className="">
            ~{formatNumber(1234, 2, true, { isShort: true, isShortUppercase: true, prefix: "$" })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteRoute;
