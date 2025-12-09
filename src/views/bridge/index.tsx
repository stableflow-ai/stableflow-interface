import { Suspense, lazy } from "react";
import useBridge from "./hooks/use-bridge";
import MainTitle from "@/components/main-title";
import PendingTransfer from "./components/pending";
import { useLiquidityQuote } from "@/stores/use-liquidity-quote";

// Dynamic import components
const Networks = lazy(() => import("./components/networks"));
const Result = lazy(() => import("./components/result"));
const BridgeButton = lazy(() => import("./components/button"));
const SupportedNetworks = lazy(() => import("./components/supported-networks"));
const HistoryDrawer = lazy(() => import("../history/drawer"));
const Trusted = lazy(() => import("./components/trusted"));
const QuoteRoutes = lazy(() => import("./components/routes"));

// Loading component
const LoadingSpinner = () => null;

export default function Bridge() {
  const liquidity = useLiquidityQuote();
  const { quote, transfer, addressValidation, errorChain } = useBridge(liquidity);

  return (
    <div className="w-full min-h-dvh pb-[100px] flex flex-col items-center overflow-y-auto overflow-x-hidden">
      <div className="pt-[60px] md:pt-[60px]">
        <MainTitle className="hidden! md:flex!" />
      </div>
      <div className="flex items-stretch gap-[10px] justify-center mt-[20px] md:min-h-[490px]">
        <div className="md:w-[488px] w-full mx-auto shrink-0">
          <PendingTransfer className="block" />
          <Suspense fallback={<LoadingSpinner />}>
            <Networks addressValidation={addressValidation} />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <QuoteRoutes
              onQuote={quote}
            />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <Result />
          </Suspense>
          <div className="px-[10px] md:px-0 w-full">
            <Suspense fallback={<LoadingSpinner />}>
              <BridgeButton
                onClick={transfer}
                onQuote={quote}
                errorChain={errorChain}
              />
            </Suspense>
          </div>
        </div>
      </div>
      <Suspense fallback={null}>
        <Trusted />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <SupportedNetworks />
      </Suspense>
      <Suspense fallback={null}>
        <HistoryDrawer />
      </Suspense>
    </div>
  );
}
