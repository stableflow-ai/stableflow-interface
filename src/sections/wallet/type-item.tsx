import useWalletsStore, { type WalletType } from "@/stores/use-wallets";
import CheckIcon from "./check-icon";
import useWalletStore from "@/stores/use-wallet";
import { usdtSol, usdtNear, usdtTron } from "@/config/tokens/usdt";
import { usdcSol, usdcNear } from "@/config/tokens/usdc";
import { useMemo } from "react";

const LABEL = {
  evm: "EVM-based",
  sol: "Solana",
  near: "Near",
  tron: "Tron"
};

export default function TypeItem({ type = "evm" }: { type: WalletType }) {
  const wallets = useWalletsStore();
  const wallet = wallets[type || "evm"];
  const walletStore = useWalletStore();
  const token = useMemo(() => {
    if (type === "evm") return null;
    if (type === "sol")
      return walletStore.selectedToken === "USDT" ? usdtSol : usdcSol;
    if (type === "near")
      return walletStore.selectedToken === "USDT" ? usdtNear : usdcNear;
    if (type === "tron" && walletStore.selectedToken === "USDT")
      return usdtTron;
  }, [type, walletStore.selectedToken]);

  return (
    <div
      className="button mx-[10px] px-[10px] py-[6px] flex justify-between items-center rounded-[12px] hover:bg-[#EDF0F7] duration-300"
      onClick={() => {
        console.log("wallet", wallet, type, token);
        if (!wallet.account || type === "evm" || !token) {
          return;
        }

        if (
          (walletStore.isTo &&
            walletStore.fromToken?.contractAddress === token.contractAddress) ||
          (!walletStore.isTo &&
            walletStore.toToken?.contractAddress === token.contractAddress)
        ) {
          return;
        }

        walletStore.set({
          [walletStore.isTo ? "toToken" : "fromToken"]: token,
          showWallet: false
        });
      }}
    >
      <div className="flex items-center gap-[10px]">
        {token?.chainIcon && (
          <img
            src={token?.chainIcon}
            alt={token?.chainName}
            className="w-[24px] h-[24px]"
          />
        )}

        <span className="text-[16px] font-[500]">{LABEL[type]}</span>
        {type !== "evm" &&
          !!token &&
          (walletStore.fromToken?.contractAddress === token.contractAddress ||
            walletStore.toToken?.contractAddress === token.contractAddress) && (
            <CheckIcon circleColor="#fff" />
          )}
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
