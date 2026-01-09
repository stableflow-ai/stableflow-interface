import Loading from "@/components/loading/icon";
import useBridgeStore from "@/stores/use-bridge";
import { TronTransferSteps } from "./config";
import clsx from "clsx";

const TronEnergy = (props: any) => {
  const { } = props;

  const bridgeStore = useBridgeStore();

  const { tronTransferStep } = bridgeStore;

  return (
    <>
      <div className="px-4 font-bold text-lg">
        Energy sponsorship ongoing
      </div>
      <div className="px-4">
        <div className="space-y-6">
          {
            TronTransferSteps.map((step, index) => {
              const isActive = tronTransferStep >= step.id;

              return (
                <div
                  className="flex items-center gap-4"
                  key={index}
                >
                  <div
                    className={clsx(
                      "relative w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 whitespace-nowrap",
                      isActive ? "border-[#6284f5] text-[#6284f5] bg-[#f0f2f9]" : "text-[#444c59] border-[#eaeaea] bg-[#f9f9f9]",
                    )}
                  >
                    <Loading isAnimation={isActive} size={16} className="" />
                    {
                      index < TronTransferSteps.length - 1 && (
                        <div className="absolute left-1/2 top-9.5 w-0.5 h-8 -translate-x-1/2 transition-all bg-[#eaeaea]"></div>
                      )
                    }
                  </div>
                  <div className="flex-1">
                    <div className={clsx("font-medium transition-all", isActive ? "text-[#6284f5]" : "text-[#444c59]")}>
                      {step.title}
                    </div>
                    <div className={clsx("text-sm mt-0.5 transition-all", isActive ? "text-[#6284f5]/80" : "text-[#444c59]")}>
                      {step.description}
                    </div>
                  </div>
                </div>
              )
            })
          }
        </div>
        <div className="mt-6 p-4 bg-[#f0f2f9] rounded-lg border border-[#6284f5] text-center text-sm text-[#6284f5]">
          <div className="flex items-center gap-2 text-sm text-[#6284f5]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-zap w-4 h-4 animate-pulse">
              <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
            </svg>
            <span>Sponsoring energy for your transaction...</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default TronEnergy;
