import clsx from "clsx";
import useWalletStore from "@/stores/use-wallet";
import useBalancesStore, { type BalancesState } from "@/stores/use-balances";
import { formatNumber } from "@/utils/format/number";
import { useMemo } from "react";
import useTokenBalance from "@/hooks/use-token-balance";
import Loading from "@/components/loading/icon";
import Big from "big.js";
import LazyImage from "@/components/lazy-image";

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
          "button w-28 md:w-32.5 h-25 shrink-0 flex flex-col justify-start rounded-xl px-1 md:px-3.5 pt-1.5 hover:bg-[#FAFBFF] button duration-300",
          isTo ? "items-end" : "items-start"
        )}
        onClick={openWallet}
      >
        <LazyImage
          src="/select-token.gif"
          alt=""
          containerClassName="w-11 md:w-12.5 h-11 md:h-12.5 rounded-full shrink-0 overflow-hidden"
          className="object-center scale-120"
          fallbackSrc={(
            <div className="w-full h-full rounded-full bg-[#EDF0F7]" />
          )}
        />
        <div
          className={clsx(
            "text-[14px] text-[#9FA7BA] mt-[6px] w-full",
            isTo ? "text-right pr-3 md:pr-4" : "text-left pl-1.5 md:pl-2"
          )}
        >
          {isTo ? "To" : "From"}
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
    const _balance = balancesStore[key]?.[token.chainId || token.blockchain]?.[token.contractAddress];
    return _balance ? formatNumber(_balance, 2, true, { round: Big.roundDown }) : "0.00";
  }, [token, balancesStore[key]?.[token.chainId || token.blockchain]?.[token.contractAddress]]);

  return (
    <div
      className={clsx(
        "button w-28 md:w-32.5 h-25 shrink-0 flex flex-col justify-start rounded-xl px-1 md:px-3.5 pt-1.5 hover:bg-[#FAFBFF] button duration-300",
        isTo ? "items-end" : "items-start"
      )}
      onClick={openWallet}
    >
      <div
        className="relative w-11 md:w-12.5 h-11 md:h-12.5 rounded-full shrink-0 bg-no-repeat bg-center bg-cover"
        style={{ backgroundImage: `url(${token.icon})` }}
      >
        <img
          src={token.chainIcon}
          className="absolute right-[-5px] bottom-[-5px] w-5 md:w-6 h-5 md:h-6 rounded-[6px] border border-white object-center object-contain shrink-0"
        />
      </div>

      <div className="text-[14px] flex items-center gap-1 md:gap-2 mt-[6px]">
        <div className="flex items-center gap-0.5 md:gap-1 leading-[100%] whitespace-nowrap">
          <div className="text-[#444C59] text-[14px] md:text-[16px] font-[500]">{token.symbol}</div>
          <div className="text-[#0E3616] text-[11px] md:text-[12px] font-[400]">{token.chainName}</div>
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
