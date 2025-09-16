import Assets from "./components/assets";
import Networks from "./components/networks";
import Result from "./components/result";
import BridgeButton from "./components/button";
import useBridge from "./hooks/use-bridge";
import SupportedNetworks from "./components/supported-networks";
import MainTitle from "@/components/main-title";
import PendingTransfer from "./components/pending";

export default function Bridge() {
  const { transfer, addressValidation } = useBridge();
  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center">
      <div className="md:w-[488px] w-full mx-auto pt-[60px] md:pt-[60px] shrink-0">
        <MainTitle className="!hidden md:!flex" />
        <PendingTransfer className="block md:hidden" />
        <div className="text-[16px] text-center mb-[30px] w-full hidden md:block">
          Stablecoins, any chain, one move.
        </div>
        <Assets />
        <Networks addressValidation={addressValidation} />
        <Result />
        <div className="px-[10px] md:px-0 w-full">
          <BridgeButton onClick={transfer} />
        </div>
      </div>
      <SupportedNetworks />
    </div>
  );
}
