import Setting from "@/sections/setting";
import { usdt } from "@/config/tokens/usdt";
import { usdc } from "@/config/tokens/usdc";
import clsx from "clsx";
import useWalletStore from "@/stores/use-wallet";

export default function Assets() {
  const walletStore = useWalletStore();

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[16px] font-[500] text-[#0E3616]">
          Bridge Asset
        </span>
        <Setting />
      </div>
      <div className="mt-[8px] flex items-center gap-[16px]">
        <AssetItem
          asset={usdt}
          active={
            walletStore.fromToken?.symbol === usdt.symbol ||
            walletStore.toToken?.symbol === usdt.symbol
          }
          onClick={() => {
            walletStore.set({ fromToken: usdt, toToken: null });
          }}
        />
        <AssetItem
          asset={usdc}
          active={
            walletStore.fromToken?.symbol === usdc.symbol ||
            walletStore.toToken?.symbol === usdc.symbol
          }
          onClick={() => {
            walletStore.set({ fromToken: usdc, toToken: null });
          }}
        />
      </div>
    </div>
  );
}

const AssetItem = ({
  asset,
  active,
  onClick
}: {
  asset: any;
  active: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      className={clsx(
        "flex items-center gap-[10px] p-[10px] w-[132px] h-[52px] rounded-[26px] cursor-pointer duration-300",
        active
          ? "shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] bg-white border border-transparent"
          : "border-dashed border-[#B3BBCE] border"
      )}
      onClick={onClick}
    >
      <img src={asset.icon} alt={asset.symbol} className="w-[24px] h-[24px]" />
      <div>
        <div className="text-[16px] font-[500]">{asset.symbol}</div>
        <div className="text-[12px] text-[#9FA7BA] mt-[-4px]">-</div>
      </div>
    </div>
  );
};
