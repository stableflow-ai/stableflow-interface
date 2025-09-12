import clsx from "clsx";
import Loading from "../loading/icon";
import { useMemo } from "react";

export default function Button({
  children,
  disabled,
  onClick = () => {},
  className,
  loading,
  isPrimary = true
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  loading?: boolean;
  isPrimary?: boolean;
}) {
  const size = useMemo(() => {
    if (className?.includes("h-")) {
      const match = className.match(/h-\[(\d+)px\]/);
      if (match) {
        return parseInt(match[1]) * 0.6;
      }
    }
    return 20;
  }, [className]);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "rounded-[12px] flex items-center justify-center",
        isPrimary && "text-[12px] font-[500]",
        className,
        disabled
          ? "bg-[#B3BBCE] cursor-not-allowed text-[#9FA7BA]"
          : "cursor-pointer button text-[#2B3337]"
      )}
    >
      {loading ? <Loading size={Math.min(size, 20)} /> : children}
    </button>
  );
}
