import { useTrack } from "@/hooks/use-track";
import { getStableflowLogo } from "@/utils/format/logo";
import clsx from "clsx";

const HyperliquidDeposit = (props: any) => {
  const { className } = props;

  const { addExternalLinkClick } = useTrack();

  return (
    <a
      href="https://deposit.stableflow.ai/"
      target="_blank"
      className={clsx(
        "hidden md:flex items-center gap-1 h-9 bg-white rounded-[20px] px-2.5 text-[#444C59] hover:text-black duration-150 font-[SpaceGrotesk] text-xs font-normal leading-[100%] shadow-[0_0_10px_0_rgba(0,0,0,0.10)] hover:shadow-[0_0_15px_0_rgba(0,0,0,0.20)] bg-[linear-gradient(90deg,_rgba(65,207,172,0.00)_0%,_rgba(65,207,172,0.50)_100%)]",
        className
      )}
      onClick={() => addExternalLinkClick({ link: "https://deposit.stableflow.ai/" })}
    >
      <span className="">
        Cheapest way to deposit
      </span>
      <img
        src={getStableflowLogo("/logo-hyperliquid.svg")}
        alt=""
        className="w-22 h-3 object-center object-contain shrink-0"
      />
      <span className="w-5 h-5 flex justify-center items-center bg-black rounded-full text-white">
        <svg width="5" height="8" viewBox="0 0 5 8" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L4 4.10345L1 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  );
};

export default HyperliquidDeposit;
