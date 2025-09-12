import Button from "@/components/button";
import useBridgeStore from "@/stores/use-bridge";

export default function BridgeButton({ onClick }: { onClick: () => void }) {
  const bridgeStore = useBridgeStore();
  return (
    <Button
      disabled={!!bridgeStore.errorTips}
      loading={bridgeStore.quoting || bridgeStore.transferring}
      className="w-full h-[50px] mt-[10px] rounded-[25px] bg-[#6284F5] shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] text-white text-[16px]"
      onClick={() => {
        if (!!bridgeStore.errorTips) return;
        onClick();
      }}
    >
      {bridgeStore.errorTips ? bridgeStore.errorTips : "Bridge"}
    </Button>
  );
}
