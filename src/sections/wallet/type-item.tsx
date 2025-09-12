import useWalletsStore, { type WalletType } from "@/stores/use-wallets";
import CheckIcon from "./check-icon";

export default function TypeItem({ type = "evm" }: { type: WalletType }) {
  const wallets = useWalletsStore();
  const wallet = wallets[type || "evm"];

  return (
    <div className="mx-[10px] px-[10px] py-[6px] flex justify-between items-center rounded-[12px] hover:bg-[#EDF0F7] duration-300">
      <div className="flex items-center gap-[10px]">
        {type === "sol" && (
          <img
            src="/chains/solana.png"
            alt="solana"
            className="w-[24px] h-[24px]"
          />
        )}
        {type === "near" && (
          <img
            src="/chains/near.png"
            alt="near"
            className="w-[24px] h-[24px]"
          />
        )}
        <span className="text-[16px] font-[500]">
          {type === "evm" ? "EVM-based" : type === "sol" ? "Solana" : "Near"}
        </span>
        {type !== "evm" && <CheckIcon circleColor="#EDF0EF" />}
      </div>
      {wallet.account ? (
        <div className="text-[#4DCF5E] text-[12px]">connected</div>
      ) : (
        <button
          className="duration-300 cursor-pointer w-[90px] h-[32px] rounded-[16px] bg-white shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] text-[14px] text-[#444C59] hover:bg-[#6284F5] hover:text-white"
          onClick={() => {
            wallet.connect();
          }}
        >
          Connect
        </button>
      )}
    </div>
  );
}
