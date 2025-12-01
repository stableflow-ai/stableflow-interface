import clsx from "clsx";
import useWalletStore from "@/stores/use-wallet";
import useBalancesStore, { type BalancesState } from "@/stores/use-balances";
import { formatNumber } from "@/utils/format/number";
import { useMemo } from "react";
import useTokenBalance from "@/hooks/use-token-balance";
import Loading from "@/components/loading/icon";
import Big from "big.js";

export default function Chain({ token, isTo }: any) {
  const walletStore = useWalletStore();
  const openWallet = () => {
    // Determine which token is currently selected for this side
    const currentToken = isTo ? walletStore.toToken : walletStore.fromToken;
    const tokenSymbol = currentToken?.symbol || (isTo ? walletStore.fromToken?.symbol : walletStore.toToken?.symbol);

    const params: Record<string, any> = {
      showWallet: true,
      isTo,
    };

    if (tokenSymbol) {
      params.selectedToken = tokenSymbol;
    }

    walletStore.set(params);
  };
  if (!token?.chainType) {
    return (
      <div
        className={clsx(
          "button h-[100px] shrink-0 flex flex-col justify-start rounded-[13px] px-[14px] pt-[6px] hover:bg-[#FAFBFF] button duration-300",
          isTo ? "items-end" : "items-start"
        )}
        onClick={openWallet}
      >
        <div className="w-[50px] h-[50px] rounded-full bg-[#EDF0F7]" />
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
  const { loading } = useTokenBalance(token, true);

  const key = `${token.chainType}Balances` as keyof BalancesState;
  const balance = useMemo(() => {
    const _balance = balancesStore[key]?.[token.contractAddress];
    return _balance ? formatNumber(_balance, 2, true, { round: Big.roundDown }) : "0.00";
  }, [token, balancesStore[key]?.[token.contractAddress]]);

  return (
    <div
      className={clsx(
        "button w-[130px] h-[100px] shrink-0 flex flex-col justify-start rounded-[13px] px-[14px] pt-[6px] hover:bg-[#FAFBFF] button duration-300",
        isTo ? "items-end" : "items-start"
      )}
      onClick={openWallet}
    >
      <div
        className="relative w-[50px] h-[50px] rounded-full shrink-0 bg-no-repeat bg-center bg-cover"
        style={{ backgroundImage: `url(${token.icon})` }}
      >
        <img
          src={token.chainIcon}
          className="absolute right-[-5px] bottom-[-5px] w-[24px] h-[24px] rounded-[6px] border border-white object-center object-contain shrink-0"
        />
      </div>

      <div className="text-[14px] flex items-center gap-[8px] mt-[6px]">
        <div className="flex items-center gap-[4px] leading-[100%] whitespace-nowrap">
          <div className="text-[#444C59] text-[16px] font-[500]">{token.symbol}</div>
          <div className="text-[#0E3616] text-[12px] font-[400]">{token.chainName}</div>
        </div>
        <img
          src="/icon-arrow-down.svg"
          className="w-[10px] h-[5px] shrink-0 object-center object-contain"
          alt=""
        />
      </div>
      <div className="text-[#9FA7BA] text-[12px]">
        {loading ? <Loading size={12} /> : balance}
      </div>
    </div>
  );
};
