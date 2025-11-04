import Button from "@/components/button";
import useBridgeStore from "@/stores/use-bridge";
import { useSwitchChain } from "wagmi";

export default function BridgeButton({
  onClick,
  errorChain
}: {
  onClick: () => void;
  errorChain: number;
}) {
  const bridgeStore = useBridgeStore();
  const { switchChain } = useSwitchChain();
  const loading = bridgeStore.quotingMap.get(bridgeStore.quoteDataService) || bridgeStore.transferring;
  return (
    <Button
      disabled={!!bridgeStore.errorTips || loading}
      loading={loading}
      className="w-full h-[50px] mt-[10px] rounded-[25px] bg-[#6284F5] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] text-white text-[16px]"
      onClick={() => {
        if (!!bridgeStore.errorTips) return;
        if (errorChain) {
          switchChain({ chainId: errorChain });
          return;
        }
        onClick();
      }}
    >
      {bridgeStore.errorTips
        ? bridgeStore.errorTips
        : errorChain
        ? "Switch Network"
        : "Transfer"}
    </Button>
  );
}
