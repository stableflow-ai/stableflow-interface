import useBridgeStore from "@/stores/use-bridge";

export default function Input() {
  const bridgeStore = useBridgeStore();
  return (
    <div className="w-[106px] relative z-[2]">
      <input
        className="text-[32px] font-[500] border-none outline-none text-center w-full"
        type="text"
        placeholder="0"
        value={bridgeStore.amount}
        onChange={(e) => {
          const value = e.target.value;
          // Only allow numbers and decimal point
          const sanitizedValue = value.replace(/[^0-9.]/g, "");

          // Prevent multiple decimal points
          const parts = sanitizedValue.split(".");
          if (parts.length > 2) {
            return;
          }

          bridgeStore.set({ amount: sanitizedValue });
        }}
      />
      <div className="text-[12px] text-[#9FA7BA] text-center w-full">
        ${bridgeStore.amount || "-"}
      </div>
    </div>
  );
}
