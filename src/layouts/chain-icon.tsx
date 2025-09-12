import clsx from "clsx";
import ethSmallIcon from "@/assets/eth-small.png";
import solSmallIcon from "@/assets/sol-small.png";
import nearSmallIcon from "@/assets/near-small.png";

const CHAINS = {
  evm: {
    color: "#6284F5",
    icon: <img src={ethSmallIcon} alt="eth" />
  },
  sol: {
    color: "#282C34",
    icon: <img src={solSmallIcon} alt="sol" />
  },
  near: {
    color: "#01ED97",
    icon: <img src={nearSmallIcon} alt="near" />
  }
};

export default function ChainIcon({
  chain,
  connected,
  className
}: {
  chain: string;
  connected: boolean;
  className?: string;
}) {
  const chainInfo = CHAINS[chain as keyof typeof CHAINS];
  return (
    <div
      className={clsx(
        "w-[26px] h-[26px] rounded-full flex justify-center items-center border",
        className,
        connected ? "border-transparent" : "border-[#A1A699] border-dashed"
      )}
      style={{ backgroundColor: connected ? chainInfo.color : "#DFE7ED" }}
    >
      <div className={clsx(!connected && "opacity-30")}>{chainInfo.icon}</div>
    </div>
  );
}
