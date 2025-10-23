import Assets from "./components/assets";
import Networks from "./components/networks";
import Result from "./components/result";
import BridgeButton from "./components/button";
import useBridge from "./hooks/use-bridge";
import SupportedNetworks from "./components/supported-networks";
import MainTitle from "@/components/main-title";
import PendingTransfer from "./components/pending";
import HistoryDrawer from "../history/drawer";
import { useLiquidityQuote } from "@/stores/use-liquidity-quote";
import Trusted from "./components/trusted";

export default function Bridge() {
  const liquidity = useLiquidityQuote();
  const { transfer, addressValidation, errorChain } = useBridge(liquidity);
  return (
    <div className="w-full h-[100dvh] pb-[100px] flex flex-col items-center overflow-y-auto overflow-x-hidden">
      <div className="md:w-[488px] w-full mx-auto pt-[60px] md:pt-[60px] shrink-0">
        <MainTitle className="!hidden md:!flex" />
        <div className="text-[16px] text-center w-full hidden md:block">
          Stablecoins to any chain, with one click.
        </div>
        <PendingTransfer className="block" />
        <Assets />
        <Networks addressValidation={addressValidation} />
        <Result />
        <div className="px-[10px] md:px-0 w-full">
          <BridgeButton onClick={transfer} errorChain={errorChain} />
        </div>
      </div>
      <SupportedNetworks />
      <Trusted />
      <HistoryDrawer />
    </div>
  );
}
