import { usdt0 } from "@/config/tokens/usdt0";
import { usdt } from "@/config/tokens/usdt";
import { usdc } from "@/config/tokens/usdc";
// import { usd1 } from "@/config/tokens/usd1";
import clsx from "clsx";
import useWalletStore from "@/stores/use-wallet";
import { useRef } from "react";
import { motion } from "framer-motion";

export default function Assets() {
  const walletStore = useWalletStore();
  const wrapperRef = useRef<any>(null);

  const currentToken = walletStore.selectedToken;

  const scrollTo = (direction: "left" | "right") => {
    const el = wrapperRef.current;
    if (el) {
      el.scrollTo({
        left: direction === "left" ? 0 : el.scrollWidth - el.clientWidth,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="w-full px-[10px] mt-[8px]">
      <div
        ref={wrapperRef}
        className="flex items-center gap-3 overflow-x-auto pb-2"
      >
        <AssetItem
          asset={usdt}
          active={currentToken === "USDT"}
          onClick={() => {
            const updateParams: any = {
              selectedToken: "USDT"
            };
            // if (walletStore.isTo) {
            //   // Only update toToken if it doesn't have a specific chain selected
            //   // If it has a chain, preserve it but update the symbol
            //   if (walletStore.toToken?.chainType) {
            //     // Keep the existing chain selection, just update the token info
            //     updateParams.toToken = {
            //       ...walletStore.toToken,
            //       symbol: usdt.symbol,
            //       decimals: usdt.decimals,
            //       icon: usdt.icon
            //     };
            //   } else {
            //     updateParams.toToken = usdt;
            //   }
            //   // Preserve fromToken when updating toToken
            //   if (walletStore.fromToken) {
            //     updateParams.fromToken = walletStore.fromToken;
            //   }
            // } else {
            //   // Only update fromToken if it doesn't have a specific chain selected
            //   // If it has a chain, preserve it but update the token info
            //   if (walletStore.fromToken?.chainType) {
            //     // Keep the existing chain selection, just update the token info
            //     updateParams.fromToken = {
            //       ...walletStore.fromToken,
            //       symbol: usdt.symbol,
            //       decimals: usdt.decimals,
            //       icon: usdt.icon
            //     };
            //   } else {
            //     updateParams.fromToken = usdt;
            //   }
            //   // Preserve toToken when updating fromToken
            //   if (walletStore.toToken) {
            //     updateParams.toToken = walletStore.toToken;
            //   }
            // }
            walletStore.set(updateParams);

            scrollTo("left");
          }}
        />
        <AssetItem
          asset={usdt0}
          active={currentToken === "USD₮0"}
          onClick={() => {
            const updateParams: any = {
              selectedToken: "USD₮0"
            };
            walletStore.set(updateParams);
          }}
        />
        <AssetItem
          asset={usdc}
          active={currentToken === "USDC"}
          disabled={false}
          onClick={() => {
            const updateParams: any = {
              selectedToken: "USDC"
            };
            // if (walletStore.isTo) {
            //   // Only update toToken if it doesn't have a specific chain selected
            //   // If it has a chain, preserve it but update the symbol
            //   if (walletStore.toToken?.chainType) {
            //     // Keep the existing chain selection, just update the token info
            //     updateParams.toToken = {
            //       ...walletStore.toToken,
            //       symbol: usdc.symbol,
            //       decimals: usdc.decimals,
            //       icon: usdc.icon
            //     };
            //   } else {
            //     updateParams.toToken = usdc;
            //   }
            //   // Preserve fromToken when updating toToken
            //   if (walletStore.fromToken) {
            //     updateParams.fromToken = walletStore.fromToken;
            //   }
            // } else {
            //   // Only update fromToken if it doesn't have a specific chain selected
            //   // If it has a chain, preserve it but update the token info
            //   if (walletStore.fromToken?.chainType) {
            //     // Keep the existing chain selection, just update the token info
            //     updateParams.fromToken = {
            //       ...walletStore.fromToken,
            //       symbol: usdc.symbol,
            //       decimals: usdc.decimals,
            //       icon: usdc.icon
            //     };
            //   } else {
            //     updateParams.fromToken = usdc;
            //   }
            //   // Preserve toToken when updating fromToken
            //   if (walletStore.toToken) {
            //     updateParams.toToken = walletStore.toToken;
            //   }
            // }
            walletStore.set(updateParams);

            scrollTo("right");
          }}
        />
        {/* <AssetItem
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
        /> */}
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
        "relative group hover:border-[#6284F5] hover:pr-[66px] flex items-center pl-[6px] gap-[10px] h-[46px] rounded-[26px] duration-150 shadow-[0_2px_6px_0_rgba(0,0,0,0.10)] border-[2px] text-black shrink-0 overflow-hidden",
        active
          ? "border-[#6284F5] pr-[66px]"
          : "border-[#ffffff] pr-[6px]",
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      )}
      onClick={() => {
        if (disabled) {
          return;
        }
        onClick?.();
      }}
    >
      <img
        src={asset.icon}
        alt={asset.symbol}
        className={clsx(
          "w-[30px] h-[30px]",
          disabled && "grayscale opacity-50"
        )}
      />
      <div
        className={clsx(
          "absolute left-[40px] duration-150 group-hover:opacity-100",
          active ? "opacity-100" : "opacity-0",
        )}
      >
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
