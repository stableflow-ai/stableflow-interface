import { Suspense, lazy, useEffect } from "react";
import useBridge from "./hooks/use-bridge";
import { useTrack } from "@/hooks/use-track";

// Dynamic import components
const Networks = lazy(() => import("./components/networks"));
const BridgeButton = lazy(() => import("./components/button"));
const SupportedNetworks = lazy(() => import("./components/supported-networks"));
const HistoryDrawer = lazy(() => import("../history/drawer"));
const Trusted = lazy(() => import("./components/trusted"));
const PendingTransfer = lazy(() => import("./components/pending"));

// Loading component
const LoadingSpinner = () => null;

export default function Bridge() {
  const { quote, transfer, addressValidation, errorChain } = useBridge();
  const { addOpen } = useTrack();

  useEffect(() => {
    addOpen();
  }, []);

  return (
    <div className="relative w-full min-h-dvh pt-[20dvh] pb-25 flex flex-col items-center overflow-y-auto overflow-x-hidden">
      <div className="flex items-stretch gap-[10px] justify-center mt-[20px] md:min-h-[490px]">
        <div className="md:w-150 w-full mx-auto shrink-0">
          <Suspense fallback={<LoadingSpinner />}>
            <PendingTransfer className="block" />
          </Suspense>
          <Suspense fallback={<LoadingSpinner />}>
            <Networks addressValidation={addressValidation} />
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
