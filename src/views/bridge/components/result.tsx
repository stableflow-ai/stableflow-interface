import useBridgeStore from "@/stores/use-bridge";
import useWalletStore from "@/stores/use-wallet";
import nearIntentsLogo from "@/assets/near-intents-logo.png";
import { formatNumber } from "@/utils/format/number";

export default function Result() {
  const bridgeStore = useBridgeStore();
  const walletStore = useWalletStore();

  return (
    <div className="w-full flex justify-between items-center p-[10px]">
      <div className="text-[12px] text-[#70788A]">Result</div>
      <div className="flex items-center">
        <div className="flex items-center gap-[3px] pr-[10px]">
          <span className="text-[12px] text-[#0E3616]/50">Powered by</span>
          <img src={nearIntentsLogo} className="w-[53px] h-[14px]" />
        </div>
        <div className="px-[14px] items-center flex gap-[6px] border-l border-[#B3BBCE]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <path
              opacity="0.5"
              d="M7 0C3.1348 0 0 3.1348 0 7C0 10.8652 3.13323 14 7 14C10.8668 14 14 10.8668 14 7C14 3.1348 10.8668 0 7 0ZM8.83542 7.71003H6.88244C6.4906 7.71003 6.17241 7.39185 6.17241 7V3.28997C6.17241 2.89812 6.4906 2.57994 6.88244 2.57994C7.27429 2.57994 7.59248 2.89812 7.59248 3.28997V6.29154H8.83542C9.22727 6.29154 9.54545 6.60972 9.54545 7.00157C9.54545 7.39342 9.22727 7.71003 8.83542 7.71003Z"
              fill="#B3BBCE"
            />
          </svg>
          <div className="text-[12px] text-[#444C59]">~13s</div>
        </div>
        <div className="px-[14px] items-center flex gap-[6px] border-l border-[#B3BBCE]">
          {walletStore.fromToken?.icon && (
            <img
              className="w-[14px] h-[14px]"
              src={walletStore.fromToken?.icon}
            />
          )}
          <div className="text-[12px] text-[#444C59]">
            ~
            {bridgeStore.quoteData?.quote?.amountOutFormatted
              ? formatNumber(
                  bridgeStore.quoteData?.quote?.amountOutFormatted,
                  2,
                  true
                )
              : "-"}
          </div>
        </div>
      </div>
    </div>
  );
}
