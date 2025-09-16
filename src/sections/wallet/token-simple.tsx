import Amount from "@/components/amount";
import Loading from "@/components/loading/icon";
import useTokenBalance from "@/hooks/use-token-balance";
import useBalancesStore, { type BalancesState } from "@/stores/use-balances";

export default function TokenSimple({ token }: any) {
  const { loading, balance } = useTokenBalance(token, true);
  const balancesStore = useBalancesStore();

  return (
    <div className="mx-[10px] h-[50px] pb-[10px] flex items-center justify-between">
      <div className="flex items-center gap-[8px]">
        <img className="w-[24px] h-[24px] rounded-full" src={token.icon} />
        <span className="text-[14px] font-[500]">{token.symbol}</span>
      </div>
      {loading ? (
        <Loading size={14} />
      ) : (
        <Amount
          amount={
            balancesStore[`${token.chainType}Balances` as keyof BalancesState][
              token.contractAddress
            ] || balance
          }
        />
      )}
    </div>
  );
}
