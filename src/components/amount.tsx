import clsx from "clsx";
import { useMemo } from "react";
import { formatNumber } from "@/utils/format/number";
import Big from "big.js";

export default function Amount({
  amount,
  className,
  integerClassName,
  decimalClassName
}: {
  amount?: any;
  className?: string;
  integerClassName?: string;
  decimalClassName?: string;
}) {
  const [int, float] = useMemo(() => {
    const _amount = formatNumber(amount, 2, false, {
      isZeroPrecision: true,
      round: Big.roundDown,
    });
    return [_amount.integer, _amount.decimal];
  }, [amount]);
  return (
    <span
      className={clsx(
        "font-[500] text-[#444C59]",
        className,
        int === "0" && float === ".00" && "text-black/30"
      )}
    >
      <span className={clsx("text-[16px]", integerClassName)}>{int}</span>
      <span className={clsx("text-[10px]", decimalClassName)}>{float}</span>
    </span>
  );
}
