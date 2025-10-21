import { Suspense, lazy } from "react";
import useBridge from "./hooks/use-bridge";
import MainTitle from "@/components/main-title";
import PendingTransfer from "./components/pending";
import { useLiquidityQuote } from "@/stores/use-liquidity-quote";

// Dynamic import components
const Assets = lazy(() => import("./components/assets"));
const Networks = lazy(() => import("./components/networks"));
const Result = lazy(() => import("./components/result"));
const BridgeButton = lazy(() => import("./components/button"));
const SupportedNetworks = lazy(() => import("./components/supported-networks"));
const HistoryDrawer = lazy(() => import("../history/drawer"));

// Loading component
const LoadingSpinner = () => null;

export default function Bridge() {
  const liquidity = useLiquidityQuote();
  const { transfer, addressValidation, errorChain } = useBridge(liquidity);
  
  return (
    <div className="w-full min-h-dvh flex flex-col items-center">
      <div className="md:w-[488px] w-full mx-auto pt-[60px] md:pt-[60px] shrink-0">
        <MainTitle className="hidden! md:flex!" />
        <div className="text-[16px] text-center w-full hidden md:block">
          Stablecoins to any chain, with one click.
        </div>
        <PendingTransfer className="block" />
        <Suspense fallback={<LoadingSpinner />}>
          <Assets />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <Networks addressValidation={addressValidation} />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <Result />
        </Suspense>
        <div className="px-[10px] md:px-0 w-full">
          <Suspense fallback={<LoadingSpinner />}>
            <BridgeButton onClick={transfer} errorChain={errorChain} />
          </Suspense>
        </div>
      </div>
      <Suspense fallback={<LoadingSpinner />}>
        <SupportedNetworks />
      </Suspense>
      <Suspense fallback={null}>
        <HistoryDrawer />
      </Suspense>
    </div>
  );
}
