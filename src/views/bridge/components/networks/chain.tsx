import clsx from "clsx";
import useWalletStore from "@/stores/use-wallet";
import useBalancesStore, { type BalancesState } from "@/stores/use-balances";
import { formatNumber } from "@/utils/format/number";
import { useMemo } from "react";

export default function Chain({ token, isTo }: any) {
  const walletStore = useWalletStore();
  const openWallet = () => {
    const params: Record<string, any> = {
      showWallet: true,
      isTo
    };
    if (walletStore.selectedToken === "USDT") {
      params.usdtExpand = true;
      params.usdcExpand = false;
    }
    if (walletStore.selectedToken === "USDC") {
      params.usdtExpand = false;
      params.usdcExpand = true;
    }

    walletStore.set(params);
  };
  if (!token?.chainType) {
    return (
      <div
        className={clsx(
          "button h-[100px] shrink-0 flex flex-col justify-center rounded-[13px] px-[14px] pt-[6px] hover:bg-[#FAFBFF] button duration-300",
          isTo ? "items-end" : "items-start"
        )}
        onClick={openWallet}
      >
        <div className="w-[50px] h-[50px] rounded-[12px] bg-[#EDF0F7]" />
        <div
          className={clsx(
            "text-[14px] text-[#9FA7BA] mt-[6px]",
            isTo && "text-right"
          )}
        >
          Select Network
        </div>
      </div>
    );
  }
  return <WithChain token={token} isTo={isTo} openWallet={openWallet} />;
}

const WithChain = ({ token, isTo, openWallet }: any) => {
  const balancesStore = useBalancesStore();

  const key = `${token.chainType}Balances` as keyof BalancesState;
  const balance = useMemo(() => {
    const _balance = balancesStore[key][token.contractAddress];
    return _balance ? formatNumber(_balance, 2, true) : "0.00";
  }, [token, balancesStore[key]?.[token.contractAddress]]);
  return (
    <div
      className={clsx(
        "button w-[120px] h-[100px] shrink-0 flex flex-col justify-center rounded-[13px] px-[14px] pt-[6px] hover:bg-[#FAFBFF] button duration-300",
        isTo ? "items-end" : "items-start"
      )}
      onClick={openWallet}
    >
      <img
        src={token.chainIcon}
        className="w-[50px] h-[50px] rounded-[12px] bg-[#EDF0F7]"
      />
      <div className="text-[14px] flex items-center gap-[8px] mt-[6px]">
        <div className="text-[#444C59]">{token.chainName}</div>
        <img
          src="/icon-arrow-down.svg"
          className="w-[10px] h-[5px] shrink-0 object-center object-contain"
          alt=""
        />
      </div>
      <div className="text-[#9FA7BA] text-[12px]">
        {balance}
      </div>
    </div>
  );
};
