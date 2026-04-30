import clsx from "clsx";
import { chainTypes } from "@/config/chains";
import LazyImage from "@/components/lazy-image";

export default function ChainIcon({
  chain,
  connected,
  className,
  style,
}: {
  chain: string;
  connected: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const chainInfo = chainTypes[chain];
  return (
    <div
      className={clsx(
        "w-6.5 h-6.5 rounded-full flex justify-center items-center border",
        className,
        connected ? "border-transparent" : "border-[#9FA7BA] border-dashed"
      )}
      style={{
        backgroundColor: connected ? chainInfo.bgColor : "#DFE7ED",
        ...style,
      }}
    >
      <LazyImage
        src={connected ? chainInfo.icon : chainInfo.iconGray}
        alt=""
        containerClassName="w-full h-full"
        className="object-center object-contain"
      />
    </div>
  );
}
