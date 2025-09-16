import Assets from "./components/assets";
import Networks from "./components/networks";
import Result from "./components/result";
import BridgeButton from "./components/button";
import useBridge from "./hooks/use-bridge";
import SupportedNetworks from "./components/supported-networks";

export default function Bridge() {
  const { transfer, addressValidation } = useBridge();
  return (
    <div className="w-full min-h-[100dvh] flex flex-col items-center">
      <div className="md:w-[488px] w-full mx-auto pt-[60px] shrink-0">
        <div className="flex justify-center items-center gap-[10px] w-full">
          <img src="/logo.svg" alt="logo" className="w-[39px] h-[39px]" />
          <span className="text-[30px] font-[500]">Stableflow</span>
        </div>
        <div className="text-[16px] text-center mb-[30px] w-full">
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
