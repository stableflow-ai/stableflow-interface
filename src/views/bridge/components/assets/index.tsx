import Setting from "@/sections/setting";
import { usdt } from "@/config/tokens/usdt";
import { usdc } from "@/config/tokens/usdc";
import clsx from "clsx";
import useWalletStore from "@/stores/use-wallet";
import useBalancesStore, { type BalancesState } from "@/stores/use-balances";
import { formatNumber } from "@/utils/format/number";
import { useMemo } from "react";

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
          onClick={() => {
            walletStore.set({
              fromToken: null,
              toToken: null,
              selectedToken: "USDC"
            });
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
  const balancesStore = useBalancesStore();
  const walletStore = useWalletStore();
  const key =
    `${walletStore.fromToken?.chainType}Balances` as keyof BalancesState;
  const balance = useMemo(() => {
    if (
      !walletStore.fromToken?.contractAddress ||
      walletStore.fromToken?.symbol !== asset.symbol
    )
      return "-";
    const _balance = balancesStore[key][walletStore.fromToken.contractAddress];
    return _balance ? formatNumber(_balance, 2, true) : "0.00";
  }, [
    walletStore.fromToken?.contractAddress,
    balancesStore[key]?.[walletStore.fromToken?.contractAddress]
  ]);

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
        <div className="text-[12px] text-[#9FA7BA] mt-[-2px]">{balance}</div>
      </div>
    </div>
  );
};
