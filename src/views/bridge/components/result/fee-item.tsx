import Loading from "@/components/loading/icon";
import { formatNumber } from "@/utils/format/number";
import Big from "big.js";
import clsx from "clsx";

const ResultFeeItem = (props: any) => {
  const { label, children, precision = 2, loading, isFormat = true, isDelete } = props;

  return (
    <div className="w-full flex items-center justify-between gap-[10px] text-[#70788A] text-[12px] font-[400] leading-[120%]">
      <div className="">{label}</div>
      <div className={clsx("text-black", isDelete && "line-through [text-decoration-color:#F00]")}>
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

export default ResultFeeItem;
