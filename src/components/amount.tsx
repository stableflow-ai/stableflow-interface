import clsx from "clsx";
import { useMemo } from "react";
import { formatNumber } from "@/utils/format/number";

export default function Amount({
  amount,
  className
}: {
  amount?: string;
  className?: string;
}) {
  const [int, float] = useMemo(() => {
    const _amount = formatNumber(amount, 2, false, {
      isZeroPrecision: true
    });
    return [_amount.integer, _amount.decimal];
  }, [amount]);
  return (
    <span
      className={clsx(
        "font-[500]",
        className,
        int === "0" && float === ".00" ? "text-black/30" : "text-[#444C59]"
      )}
    >
      <span className="text-[16px]">{int}</span>
      <span className="text-[10px]">{float}</span>
    </span>
  );
}
