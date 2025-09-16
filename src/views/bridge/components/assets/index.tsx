import Setting from "@/sections/setting";
import { usdt } from "@/config/tokens/usdt";
import { usdc } from "@/config/tokens/usdc";
import { usd1 } from "@/config/tokens/usd1";
import clsx from "clsx";
import useWalletStore from "@/stores/use-wallet";

export default function Assets() {
  const walletStore = useWalletStore();

  return (
    <div className="w-full px-[10px] md:px-0">
      <div className="flex items-center justify-between">
        <span className="text-[16px] font-[500] text-[#0E3616]">
          Bridge Asset
        </span>
        <Setting />
      </div>
      <div className="mt-[8px] flex items-center gap-[16px]">
        <AssetItem
          asset={usdt}
          active={walletStore.selectedToken === "USDT"}
          onClick={() => {
            walletStore.set({
              fromToken: null,
              toToken: null,
              selectedToken: "USDT"
            });
          }}
        />
        <AssetItem
          asset={usdc}
          active={walletStore.selectedToken === "USDC"}
          disabled={true}
          onClick={() => {
            // walletStore.set({
            //   fromToken: null,
            //   toToken: null,
            //   selectedToken: "USDC"
            // });
          }}
        />
        <AssetItem
          asset={usd1}
          active={false}
          disabled={true}
          onClick={() => {
            // walletStore.set({
            //   fromToken: null,
            //   toToken: null,
            //   selectedToken: "USD1"
            // });
          }}
        />
      </div>
    </div>
  );
}

const AssetItem = ({
  asset,
  active,
  disabled = false,
  onClick
}: {
  asset: any;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      className={clsx(
        "flex items-center gap-[10px] p-[10px] w-[132px] h-[52px] rounded-[26px] duration-300",
        active
          ? "shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] bg-white border border-transparent"
          : "border-dashed border-[#B3BBCE] border",
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      )}
      onClick={onClick}
    >
      <img
        src={asset.icon}
        alt={asset.symbol}
        className={clsx(
          "w-[24px] h-[24px]",
          disabled && "grayscale opacity-50"
        )}
      />
      <div>
        <div
          className={clsx("text-[16px] font-[500]", disabled && "opacity-50")}
        >
          {asset.symbol}
        </div>
        <div className="text-[12px] text-[#9FA7BA] mt-[-2px]">
          {disabled && "soon"}
        </div>
      </div>
    </div>
  );
};
