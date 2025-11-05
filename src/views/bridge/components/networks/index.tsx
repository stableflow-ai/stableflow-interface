import Address from "./address";
import useWalletStore from "@/stores/use-wallet";
import Chain from "./chain";
import Input from "./input";
import Bottom from "./bottom";
import { useSwitchChain } from "wagmi";

export default function Networks({ addressValidation }: any) {
  const walletStore = useWalletStore();
  const { switchChain } = useSwitchChain();
  return (
    <div className="w-full mt-[20px] px-[10px] md:px-0">
      <div className="text-[16px] text-[#444C59] md:text-[#0E3616]">Select Networks</div>
      <div className="mt-[10px] bg-white rounded-[12px] border border-[#F2F2F2] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)]">
        <div className="h-[36px] px-[20px] flex items-center bg-[#FAFBFF] rounded-t-[12px] border-b border-[#EBF0F8]">
          <div className="w-1/2 border-r border-[#EBF0F8] flex items-center h-full">
            <Address token={walletStore.fromToken} isTo={false} />
          </div>
          <div className="w-1/2 flex items-center justify-end h-full pl-[10px]">
            <Address
              token={walletStore.toToken}
              isTo={true}
              addressValidation={addressValidation}
            />
          </div>
        </div>
        <div className="w-full mt-[8px]">
          <div className="p-[6px] flex items-center relative">
            <Chain token={walletStore.fromToken} isTo={false} />
            <Input />
            <Chain token={walletStore.toToken} isTo={true} />
            <ExchangeButton
              onClick={async () => {
                const fromToken = walletStore.fromToken;
                const toToken = walletStore.toToken;
                if (toToken.chainType === "evm") {
                  await switchChain({ chainId: toToken.chainId });
                }
                walletStore.set({ fromToken: toToken, toToken: fromToken });
              }}
            />
          </div>

          <Bottom token={walletStore.fromToken} />
        </div>
      </div>
    </div>
  );
}

const ExchangeButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="absolute z-[1] bottom-[-12px] left-[50%] -translate-x-1/2 flex items-center justify-center button w-[22px] h-[22px] rounded-[6px] bg-white shadow-[0_0_6px_0_rgba(0,0,0,0.10)]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
      >
        <path
          d="M1 3.8913H10.913L7.6087 1"
          stroke="#B3BBCE"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10.9131 7.6087H1.00004L4.30439 10.5"
          stroke="#B3BBCE"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};
